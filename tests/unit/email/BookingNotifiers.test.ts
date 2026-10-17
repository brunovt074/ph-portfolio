import { describe, expect, it } from 'vitest';
import { BookingNotificationError } from '@/domain/booking/BookingNotificationError';
import { ConsoleBookingNotifier } from '@/infrastructure/email/ConsoleBookingNotifier';
import { createBookingNotifier } from '@/infrastructure/email/createBookingNotifier';
import type { ResendEmailClient, ResendEmailPayload } from '@/infrastructure/email/ResendEmailClient';
import { ResendBookingNotifier } from '@/infrastructure/email/ResendBookingNotifier';
import { UnavailableBookingNotifier } from '@/infrastructure/email/UnavailableBookingNotifier';
import { aBooking, aSlotBooking } from '../../fixtures/aBooking';
import { aPayment } from '../../fixtures/aPayment';

const zone = 'America/Argentina/Buenos_Aires';
const configured = { apiKey: 're_test', toEmail: 'lara@example.com', fromEmail: 'sitio@example.com', consoleDelivery: false, timeZone: zone };

const clientReturning = (errors: ({ message: string } | null)[]) => {
  const payloads: ResendEmailPayload[] = [];
  const client: ResendEmailClient = {
    emails: {
      async send(payload) {
        payloads.push(payload);
        return { error: errors[payloads.length - 1] ?? null };
      },
    },
  };
  return { client, payloads };
};

describe('ResendBookingNotifier', () => {
  it('sends the studio the booking and the client her confirmation, each replying to the other', async () => {
    const { client, payloads } = clientReturning([null, null]);

    await new ResendBookingNotifier(client, 'lara@example.com', 'sitio@example.com', zone).paymentConfirmed(aBooking());

    expect(payloads).toHaveLength(2);
    expect(payloads[0]).toMatchObject({
      from: 'sitio@example.com',
      to: 'lara@example.com',
      replyTo: 'camila@example.com',
      subject: 'Nueva reserva con seña: Maternidad — Camila Ríos',
    });
    expect(payloads[1]).toMatchObject({
      from: 'sitio@example.com',
      to: 'camila@example.com',
      replyTo: 'lara@example.com',
      subject: 'Tu reserva con Lara Vischi está confirmada',
    });
  });

  it('sends the client the calendar file of her reserved turn', async () => {
    const { client, payloads } = clientReturning([null, null]);

    await new ResendBookingNotifier(client, 'lara@example.com', 'sitio@example.com', zone).paymentConfirmed(aSlotBooking());

    expect(payloads[0]?.attachments).toBeUndefined();
    expect(payloads[1]?.attachments?.[0]?.filename).toBe('reserva.ics');
  });

  it('warns both Lara and the client when the paid turn was taken by someone else', async () => {
    const { client, payloads } = clientReturning([null, null]);

    await new ResendBookingNotifier(client, 'lara@example.com', 'sitio@example.com', zone).slotConflict(aSlotBooking());

    expect(payloads[0]).toMatchObject({ to: 'lara@example.com', subject: 'Pago recibido sin turno disponible: Maternidad — Camila Ríos' });
    expect(payloads[1]).toMatchObject({ to: 'camila@example.com', subject: 'Recibí tu pago: coordinemos otro horario' });
  });

  it('tells only the studio about a second payment, never the client', async () => {
    const { client, payloads } = clientReturning([null]);

    await new ResendBookingNotifier(client, 'lara@example.com', 'sitio@example.com', zone).duplicatePayment(aBooking(), aPayment());

    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toMatchObject({ to: 'lara@example.com', replyTo: 'camila@example.com', subject: 'Segundo pago recibido: Camila Ríos' });
  });

  it('tells only the studio about a refund', async () => {
    const { client, payloads } = clientReturning([null]);

    await new ResendBookingNotifier(client, 'lara@example.com', 'sitio@example.com', zone).paymentRefunded(aBooking(), aPayment());

    expect(payloads).toHaveLength(1);
    expect(payloads[0]).toMatchObject({ to: 'lara@example.com', subject: 'Pago devuelto: Camila Ríos ($ 47.500)' });
  });

  it('fails when the studio alert is rejected', async () => {
    const { client } = clientReturning([{ message: 'quota exceeded' }]);

    await expect(new ResendBookingNotifier(client, 'lara@example.com', 'sitio@example.com', zone).duplicatePayment(aBooking(), aPayment())).rejects.toBeInstanceOf(
      BookingNotificationError,
    );
  });

  it('fails when the studio email is rejected but still sends the client confirmation', async () => {
    const { client, payloads } = clientReturning([{ message: 'quota exceeded' }, null]);

    await expect(new ResendBookingNotifier(client, 'lara@example.com', 'sitio@example.com', zone).paymentConfirmed(aBooking())).rejects.toThrow(
      new BookingNotificationError('quota exceeded'),
    );
    expect(payloads).toHaveLength(2);
  });

  it('fails when the client email is rejected', async () => {
    const { client } = clientReturning([null, { message: 'invalid recipient' }]);

    await expect(new ResendBookingNotifier(client, 'lara@example.com', 'sitio@example.com', zone).paymentConfirmed(aBooking())).rejects.toBeInstanceOf(
      BookingNotificationError,
    );
  });
});

describe('createBookingNotifier', () => {
  it('uses Resend when the account is configured, even in development', () => {
    expect(createBookingNotifier(configured)).toBeInstanceOf(ResendBookingNotifier);
    expect(createBookingNotifier({ ...configured, consoleDelivery: true })).toBeInstanceOf(ResendBookingNotifier);
  });

  it('logs to the console during local development without keys', () => {
    expect(createBookingNotifier({ apiKey: undefined, toEmail: undefined, fromEmail: undefined, consoleDelivery: true, timeZone: zone })).toBeInstanceOf(ConsoleBookingNotifier);
  });

  it('refuses to pretend delivery in production without keys', async () => {
    const notifier = createBookingNotifier({ ...configured, apiKey: undefined });

    expect(notifier).toBeInstanceOf(UnavailableBookingNotifier);
    await expect(notifier.paymentConfirmed(aBooking(), aPayment())).rejects.toBeInstanceOf(BookingNotificationError);
    await expect(notifier.slotConflict(aBooking(), aPayment())).rejects.toBeInstanceOf(BookingNotificationError);
    await expect(notifier.duplicatePayment(aBooking(), aPayment())).rejects.toBeInstanceOf(BookingNotificationError);
    await expect(notifier.paymentRefunded(aBooking(), aPayment())).rejects.toBeInstanceOf(BookingNotificationError);
  });
});

describe('ConsoleBookingNotifier', () => {
  it('logs only the booking id, never personal data', async () => {
    const lines: string[] = [];
    const notifier = new ConsoleBookingNotifier((line) => lines.push(line));

    await notifier.paymentConfirmed(aBooking());
    await notifier.slotConflict(aBooking());
    await notifier.duplicatePayment(aBooking());
    await notifier.paymentRefunded(aBooking());

    expect(lines).toEqual([
      '[booking] payment confirmed booking-1',
      '[booking] slot conflict booking-1',
      '[booking] duplicate payment booking-1',
      '[booking] payment refunded booking-1',
    ]);
  });

  it('uses console.info when no logger is given', async () => {
    const originalInfo = console.info;
    const calls: string[] = [];
    console.info = (line: string) => calls.push(line);
    try {
      await new ConsoleBookingNotifier().paymentConfirmed(aBooking());
    } finally {
      console.info = originalInfo;
    }

    expect(calls).toEqual(['[booking] payment confirmed booking-1']);
  });
});

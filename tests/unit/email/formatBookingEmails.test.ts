import { describe, expect, it } from 'vitest';
import { formatBookingEmails } from '@/infrastructure/email/formatBookingEmails';
import { aBooking, aSlotBooking } from '../../fixtures/aBooking';

const zone = 'America/Argentina/Buenos_Aires';

describe('formatBookingEmails', () => {
  it('tells the studio who booked what, when, and how much was paid when the client chose the deposit', () => {
    const { toStudio } = formatBookingEmails(aBooking({ notes: 'Prefiero luz natural' }), zone);

    expect(toStudio.subject).toBe('Nueva reserva con seña: Maternidad — Camila Ríos');
    expect(toStudio.text).toBe(
      [
        'Nombre: Camila Ríos',
        'Email: camila@example.com',
        'Teléfono: +54 9 341 000 0000',
        'Sesión: Maternidad',
        'Fecha propuesta: viernes, 20 de noviembre de 2026',
        'Franja: por la mañana',
        'Seña pagada: $ 47.500',
        'Saldo a abonar el día de la sesión: $ 47.500',
        'Total de la sesión: $ 95.000',
        'Notas: Prefiero luz natural',
        'Reserva: booking-1',
      ].join('\n'),
    );
  });

  it('confirms the deposit to the client, mentions the balance and promises an answer within 48 hours', () => {
    const { toCustomer } = formatBookingEmails(aBooking({ schedule: { kind: 'request', preferredDate: '2026-11-20', timeSlot: 'afternoon' } }), zone);

    expect(toCustomer.subject).toBe('Tu reserva con Sarah Moreau está confirmada');
    expect(toCustomer.text).toContain('Hola Camila Ríos:');
    expect(toCustomer.text).toContain('Recibí tu seña. Dentro de las próximas 48 horas te escribo para confirmar la fecha y los detalles.');
    expect(toCustomer.text).toContain('El saldo de $ 47.500 se abona el día de la sesión.');
    expect(toCustomer.text).toContain('Franja: por la tarde');
    expect(toCustomer.text).toContain('Pagado: $ 47.500');
    expect(toCustomer.attachments).toBeUndefined();
  });

  it('tells a client who paid everything that she has no balance left', () => {
    const { toCustomer, toStudio } = formatBookingEmails(aBooking({ paymentPlan: 'full' }), zone);

    expect(toCustomer.text).toContain('Recibí el pago completo de tu sesión.');
    expect(toCustomer.text).toContain('Pagado: $ 95.000');
    expect(toCustomer.text).not.toContain('saldo');
    expect(toStudio.subject).toBe('Nueva reserva con pago completo: Maternidad — Camila Ríos');
    expect(toStudio.text).toContain('Pago completo: $ 95.000');
    expect(toStudio.text).not.toContain('Saldo');
  });

  it('gives the client her reserved turn and a calendar file when she picked a slot', () => {
    const { toCustomer, toStudio } = formatBookingEmails(aSlotBooking(), zone);

    expect(toCustomer.text).toContain('Tu turno quedó reservado.');
    expect(toCustomer.text).toContain('Turno: jueves, 22 de octubre de 2026, de 10:00 a 11:30 h');
    expect(toStudio.text).toContain('Turno: jueves, 22 de octubre de 2026, de 10:00 a 11:30 h');
    expect(toCustomer.attachments).toHaveLength(1);
    expect(toCustomer.attachments?.[0]?.filename).toBe('reserva.ics');
    expect(toCustomer.attachments?.[0]?.content).toContain('DTSTART:20261022T130000Z');
    expect(toCustomer.attachments?.[0]?.content).toContain('UID:booking-1@laramoreau');
  });

  it('describes a client with no time preference', () => {
    const booking = aBooking({ schedule: { kind: 'request', preferredDate: '2026-11-20', timeSlot: 'any' } });

    expect(formatBookingEmails(booking, zone).toStudio.text).toContain('Franja: en cualquier horario');
  });

  it('says there are no notes when the client wrote none', () => {
    expect(formatBookingEmails(aBooking({ notes: '' }), zone).toStudio.text).toContain('Notas: Sin notas');
  });

  it('keeps the studio subject on a single line even if the name has line breaks', () => {
    const { toStudio } = formatBookingEmails(aBooking({ customer: { name: 'Camila\r\nBcc: x@y.z', email: 'c@e.com', phone: '1' } }), zone);

    expect(toStudio.subject).toBe('Nueva reserva con seña: Maternidad — Camila Bcc: x@y.z');
  });
});

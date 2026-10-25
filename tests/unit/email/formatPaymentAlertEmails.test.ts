import { describe, expect, it } from 'vitest';
import { formatDuplicatePaymentEmail } from '@/infrastructure/email/formatDuplicatePaymentEmail';
import { formatRefundedPaymentEmail } from '@/infrastructure/email/formatRefundedPaymentEmail';
import { aBooking } from '../../fixtures/aBooking';
import { aPayment } from '../../fixtures/aPayment';

describe('payment alert emails for the studio', () => {
  it('a second payment names the booking, the client and the amount to review in Mercado Pago', () => {
    const email = formatDuplicatePaymentEmail(aBooking(), aPayment({ amountCents: 4_750_000 }));

    expect(email.text).toBe(
      'Entró un segundo pago para la reserva booking-1 de Camila Ríos por US$ 47.500. Revisá si corresponde devolverlo desde Mercado Pago.',
    );
  });

  it('a refund asks the photographer to free the turn in her calendar if needed', () => {
    const email = formatRefundedPaymentEmail(aBooking(), aPayment());

    expect(email.text).toBe('Se devolvió el pago de la reserva booking-1 de Camila Ríos. Si corresponde, liberá el turno en tu calendario.');
  });
});

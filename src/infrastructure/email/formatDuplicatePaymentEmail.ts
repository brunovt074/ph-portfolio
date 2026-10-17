import type { Booking } from '@/domain/booking/Booking';
import type { Payment } from '@/domain/payment/Payment';
import type { FormattedEmail } from './FormattedEmail';
import { formatMoney } from './formatMoney';
import { singleLine } from './singleLine';

export const formatDuplicatePaymentEmail = (booking: Booking, payment: Payment): FormattedEmail => ({
  subject: `Segundo pago recibido: ${singleLine(booking.customer.name)}`,
  text: `Entró un segundo pago para la reserva ${booking.id} de ${booking.customer.name} por ${formatMoney(payment.amountCents)}. Revisá si corresponde devolverlo desde Mercado Pago.`,
});

import type { Booking } from '@/domain/booking/Booking';
import type { BookingEmails } from './BookingEmails';
import { formatClock } from './formatClock';
import { formatLongDate } from './formatLongDate';
import { formatMoney } from './formatMoney';
import { singleLine } from './singleLine';

export const formatSlotConflictEmails = (booking: Booking, timeZone: string): BookingEmails => {
  const chosen =
    booking.schedule.kind === 'slot'
      ? `${formatLongDate(booking.schedule.start, timeZone)}, ${formatClock(booking.schedule.start, timeZone)} h`
      : 'Sin turno';
  const paid = booking.paymentPlan === 'full' ? booking.totalCents : booking.depositCents;
  const toStudio = [
    'Entró un pago pero el turno ya no está libre: coordiná otro horario o devolvé el pago.',
    '',
    `Nombre: ${booking.customer.name}`,
    `Email: ${booking.customer.email}`,
    `Teléfono: ${booking.customer.phone}`,
    `Sesión: ${booking.offerTitle}`,
    `Turno elegido: ${chosen}`,
    `Pagado: ${formatMoney(paid)}`,
    `Notas: ${booking.notes || 'Sin notas'}`,
    `Reserva: ${booking.id}`,
  ];
  const toCustomer = [
    `Hola ${booking.customer.name}:`,
    '',
    'Recibí tu pago. El horario que elegiste se ocupó mientras pagabas; te escribo hoy para coordinar otro.',
    '',
    `Sesión: ${booking.offerTitle}`,
    `Pagado: ${formatMoney(paid)}`,
    '',
    'Sarah Moreau',
  ];
  return {
    toStudio: {
      subject: `Pago recibido sin turno disponible: ${singleLine(booking.offerTitle)} — ${singleLine(booking.customer.name)}`,
      text: toStudio.join('\n'),
    },
    toCustomer: { subject: 'Recibí tu pago: coordinemos otro horario', text: toCustomer.join('\n') },
  };
};

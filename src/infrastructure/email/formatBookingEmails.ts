import type { Booking } from '@/domain/booking/Booking';
import { BRAND } from '@/config/brand';
import type { TimeSlot } from '@/domain/booking/TimeSlot';
import type { BookingEmails } from './BookingEmails';
import { buildIcsEvent } from './buildIcsEvent';
import { formatClock } from './formatClock';
import { formatLongDate } from './formatLongDate';
import { formatMoney } from './formatMoney';
import { singleLine } from './singleLine';

const slotLabels: Record<TimeSlot, string> = {
  morning: 'por la mañana',
  afternoon: 'por la tarde',
  any: 'en cualquier horario',
};

const scheduleLines = (booking: Booking, timeZone: string): string[] => {
  const { schedule } = booking;
  if (schedule.kind === 'slot') {
    return [`Turno: ${formatLongDate(schedule.start, timeZone)}, de ${formatClock(schedule.start, timeZone)} a ${formatClock(schedule.end, timeZone)} h`];
  }
  return [
    `Fecha propuesta: ${formatLongDate(new Date(`${schedule.preferredDate}T12:00:00Z`), 'UTC')}`,
    `Franja: ${slotLabels[schedule.timeSlot]}`,
  ];
};

const paymentLines = (booking: Booking): string[] =>
  booking.paymentPlan === 'full'
    ? [`Pago completo: ${formatMoney(booking.totalCents)}`]
    : [
        `Seña pagada: ${formatMoney(booking.depositCents)}`,
        `Saldo a abonar el día de la sesión: ${formatMoney(booking.totalCents - booking.depositCents)}`,
      ];

const customerIntro = (booking: Booking): string[] => {
  const received = booking.paymentPlan === 'full' ? 'Recibí el pago completo de tu sesión.' : 'Recibí tu seña.';
  const balance =
    booking.paymentPlan === 'full' ? [] : [`El saldo de ${formatMoney(booking.totalCents - booking.depositCents)} se abona el día de la sesión.`];
  const next =
    booking.schedule.kind === 'slot'
      ? 'Tu turno quedó reservado. Te adjunto el evento para que lo sumes a tu calendario.'
      : 'Dentro de las próximas 48 horas te escribo para confirmar la fecha y los detalles.';
  return [`${received} ${next}`, ...balance];
};

export const formatBookingEmails = (booking: Booking, timeZone: string): BookingEmails => {
  const summary = [`Sesión: ${booking.offerTitle}`, ...scheduleLines(booking, timeZone), ...paymentLines(booking)];
  const toStudio = [
    `Nombre: ${booking.customer.name}`,
    `Email: ${booking.customer.email}`,
    `Teléfono: ${booking.customer.phone}`,
    ...summary,
    `Total de la sesión: ${formatMoney(booking.totalCents)}`,
    `Notas: ${booking.notes || 'Sin notas'}`,
    `Reserva: ${booking.id}`,
  ];
  const toCustomer = [
    `Hola ${booking.customer.name}:`,
    '',
    ...customerIntro(booking),
    '',
    `Sesión: ${booking.offerTitle}`,
    ...scheduleLines(booking, timeZone),
    `Pagado: ${formatMoney(booking.paymentPlan === 'full' ? booking.totalCents : booking.depositCents)}`,
    '',
    BRAND.fullName,
  ];
  const studioKind = booking.paymentPlan === 'full' ? 'con pago completo' : 'con seña';
  const { schedule } = booking;
  return {
    toStudio: {
      subject: `Nueva reserva ${studioKind}: ${singleLine(booking.offerTitle)} — ${singleLine(booking.customer.name)}`,
      text: toStudio.join('\n'),
    },
    toCustomer: {
      subject: `Tu reserva con ${BRAND.fullName} está confirmada`,
      text: toCustomer.join('\n'),
      ...(schedule.kind === 'slot'
        ? {
            attachments: [
              {
                filename: 'reserva.ics',
                content: buildIcsEvent({
                  bookingId: booking.id,
                  start: schedule.start,
                  end: schedule.end,
                  stamp: booking.updatedAt,
                  summary: `${booking.offerTitle} con ${BRAND.fullName}`,
                  description: `Reserva ${booking.id}`,
                }),
              },
            ],
          }
        : {}),
    },
  };
};

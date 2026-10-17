import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import type { TimeSlot } from '@/domain/booking/TimeSlot';
import { pathTo } from '@/domain/routing/pathTo';
import { getBookingServices } from '@/infrastructure/bookingContainer';
import type { BookingActionResult } from './BookingActionResult';
import { bookingProblemOf } from './bookingProblemOf';
import { bookingValidationMessages as messages } from './bookingValidationMessages';

const timeSlotOf: Record<'manana' | 'tarde' | 'indistinto', TimeSlot> = { manana: 'morning', tarde: 'afternoon', indistinto: 'any' };

const optionalText = (max: number, message: string) =>
  z.string().trim().max(max, message).nullish().transform((value) => value ?? '');

const optionalPattern = (pattern: RegExp, message: string) =>
  z.string().trim().nullish().transform((value) => value ?? '').refine((value) => value === '' || pattern.test(value), message);

const withDefault = (fallback: string) => z.string().nullish().transform((value) => (value ? value : fallback));

export const booking = defineAction({
  accept: 'form',
  input: z.object({
    sesion: z.string({ error: messages.sesion }).trim().regex(/^[a-z0-9-]{1,60}$/, messages.sesion),
    fecha: optionalPattern(/^\d{4}-\d{2}-\d{2}$/, messages.fecha),
    slot: optionalPattern(/^\d{4}-\d{2}-\d{2}T[\d:.]{5,16}Z$/, messages.slot),
    franja: withDefault('indistinto').pipe(z.enum(['manana', 'tarde', 'indistinto'], { error: messages.franja })),
    plan: withDefault('deposit').pipe(z.enum(['deposit', 'full'], { error: messages.plan })),
    nombre: z.string({ error: messages.nombre }).trim().min(2, messages.nombre).max(80, messages.nombre),
    email: z.string({ error: messages.email }).trim().max(200, messages.email).pipe(z.email(messages.email)),
    telefono: z.string({ error: messages.telefono }).trim().regex(/^[0-9+()\s-]{6,30}$/, messages.telefono),
    notas: optionalText(1000, messages.notas),
    acepto: z.string({ error: messages.acepto }).refine((value) => value === 'on', messages.acepto),
    sitio_web: z.string().max(200).nullish().transform((value) => value ?? ''),
  }),
  handler: async (input): Promise<BookingActionResult> => {
    if (input.sitio_web) {
      return { status: 'created', checkoutUrl: pathTo('es', { route: 'reservas' }) };
    }
    const services = await getBookingServices();
    const result = await services.createBooking.execute({
      offerSlug: input.sesion,
      paymentPlan: input.plan,
      preferredDate: input.fecha,
      timeSlot: timeSlotOf[input.franja],
      name: input.nombre,
      email: input.email,
      phone: input.telefono,
      notes: input.notas,
      ...(input.slot ? { slotStart: input.slot } : {}),
    });
    if (!result.ok) {
      return { status: 'rejected', problem: bookingProblemOf(result.error) };
    }
    return { status: 'created', checkoutUrl: result.value.checkoutUrl };
  },
});

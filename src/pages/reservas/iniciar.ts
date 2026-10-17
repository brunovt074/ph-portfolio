import { actions, isInputError } from 'astro:actions';
import type { APIRoute } from 'astro';
import type { BookingProblem } from '@/actions/BookingProblem';

export const prerender = false;

const reasonOf: Record<BookingProblem, string> = {
  offer: 'sesion',
  date: 'fecha',
  slot_required: 'turno',
  slot_taken: 'turno',
  calendar: 'agenda',
  gateway: 'pago',
};

export const POST: APIRoute = async (context) => {
  const result = await context.callAction(actions.booking, await context.request.formData());
  if (result.error) {
    const query = isInputError(result.error) ? `campos=${Object.keys(result.error.fields).join(',')}` : 'motivo=pago';
    return context.redirect(`/reservas/error?${query}`, 303);
  }
  if (result.data.status === 'created') {
    return context.redirect(result.data.checkoutUrl, 303);
  }
  return context.redirect(`/reservas/error?motivo=${reasonOf[result.data.problem]}`, 303);
};

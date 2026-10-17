import type { APIRoute } from 'astro';
import { getBookingServices } from '@/infrastructure/bookingContainer';
import { isUuid } from '@/infrastructure/db/isUuid';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const form = await context.request.formData();
  const bookingId = String(form.get('reserva') ?? '');
  if (!isUuid(bookingId)) {
    return context.redirect('/reservas/error?motivo=pago', 303);
  }
  const services = await getBookingServices();
  const result = await services.retryDepositCheckout.execute(bookingId);
  if (result.ok) {
    return context.redirect(result.value.checkoutUrl, 303);
  }
  return context.redirect(result.error === 'gateway_unavailable' ? '/reservas/error?motivo=pago' : `/reservas/${bookingId}`, 303);
};

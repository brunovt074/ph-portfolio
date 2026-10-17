import type { APIRoute } from 'astro';
import { TRUST_PROXY } from 'astro:env/server';
import type { ListSlotsError } from '@/application/results/ListSlotsError';
import { getBookingServices } from '@/infrastructure/bookingContainer';
import { resolveClientKey } from '@/infrastructure/rateLimit/resolveClientKey';
import { slotsRateLimiter } from '@/infrastructure/rateLimit/slotsRateLimiter';

export const prerender = false;

const statusOf: Record<ListSlotsError, number> = { invalid_range: 400, offer_not_found: 404, calendar_unavailable: 503 };

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const GET: APIRoute = async ({ url, request, clientAddress }) => {
  const key = resolveClientKey(request.headers.get('x-forwarded-for'), clientAddress, TRUST_PROXY === 'true');
  if (!slotsRateLimiter.hit(key)) {
    return json({ error: 'too_many_requests' }, 429);
  }
  const services = await getBookingServices();
  const result = await services.listAvailableSlots.execute({
    offerSlug: url.searchParams.get('session') ?? '',
    from: url.searchParams.get('from') ?? '',
    to: url.searchParams.get('to') ?? '',
  });
  return result.ok ? json(result.value, 200) : json({ error: result.error }, statusOf[result.error]);
};

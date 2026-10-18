import type { APIRoute } from 'astro';
import { getBookingServices } from '@/infrastructure/bookingContainer';
import { readLimitedBody } from '@/infrastructure/http/readLimitedBody';
import { ConsoleErrorReporter } from '@/infrastructure/reporting/ConsoleErrorReporter';

export const prerender = false;

const MAX_BODY_BYTES = 64 * 1024;

const reporter = new ConsoleErrorReporter();

const respond = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const parseBody = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

export const POST: APIRoute = async ({ request, params, url }) => {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return respond({ ok: false }, 413);
  }
  const text = await readLimitedBody(request, MAX_BODY_BYTES);
  if (text === null) {
    return respond({ ok: false }, 413);
  }
  const provider = params['provider'] ?? '';
  try {
    const services = await getBookingServices();
    const result = await services.processPaymentNotification.execute(provider, {
      headers: Object.fromEntries(request.headers),
      query: Object.fromEntries(url.searchParams),
      body: parseBody(text),
    });
    if (result.ok) {
      return respond({ ok: true }, 200);
    }
    return respond({ ok: false }, result.error === 'unknown_provider' ? 404 : 401);
  } catch (error) {
    reporter.report(new Error(`Payment webhook ${provider} failed: ${error instanceof Error ? error.name : 'unknown'}`));
    return respond({ ok: false }, 500);
  }
};

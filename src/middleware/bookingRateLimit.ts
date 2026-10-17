import { ActionError } from 'astro:actions';
import { defineMiddleware } from 'astro:middleware';
import { TRUST_PROXY } from 'astro:env/server';
import { esTexts } from '@/infrastructure/texts/defaults/esTexts';
import { bookingRateLimiter } from '@/infrastructure/rateLimit/bookingRateLimiter';
import { resolveClientKey } from '@/infrastructure/rateLimit/resolveClientKey';

const FORM_PATHS = ['/reservas/iniciar', '/reservas/reintentar'];
const ACTION_PATH_PREFIX = '/_actions/booking';
const LIMIT_REDIRECT = '/reservas/error?motivo=limite';

const withoutTrailingSlash = (pathname: string) => pathname.replace(/\/+$/, '');

const rateLimitedAction = () => {
  const error = new ActionError({ code: 'TOO_MANY_REQUESTS', message: esTexts.booking.problemRateLimited });
  return new Response(JSON.stringify({ ...error, message: error.message }), {
    status: error.status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const bookingRateLimit = defineMiddleware((context, next) => {
  const pathname = withoutTrailingSlash(context.url.pathname);
  const isForm = FORM_PATHS.includes(pathname);
  const isAction = pathname.startsWith(ACTION_PATH_PREFIX);
  if (context.request.method !== 'POST' || (!isForm && !isAction)) {
    return next();
  }
  const key = resolveClientKey(context.request.headers.get('x-forwarded-for'), context.clientAddress, TRUST_PROXY === 'true');
  if (bookingRateLimiter.hit(key)) {
    return next();
  }
  return isForm ? context.redirect(LIMIT_REDIRECT, 303) : rateLimitedAction();
});

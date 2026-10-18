import { ActionError } from 'astro:actions';
import { defineMiddleware, sequence } from 'astro:middleware';
import { TRUST_PROXY } from 'astro:env/server';
import { localeFromPath } from '@/domain/routing/localeFromPath';
import { bookingRateLimit } from '@/middleware/bookingRateLimit';
import { invokedAction } from '@/middleware/invokedAction';
import { contactRateLimiter } from '@/infrastructure/rateLimit/contactRateLimiter';
import { resolveClientKey } from '@/infrastructure/rateLimit/resolveClientKey';

const FORM_PATH = '/contacto/enviar';
const ACTION_NAME = 'contact';

const isFormSubmission = (pathname: string) => pathname === FORM_PATH || pathname === `${FORM_PATH}/`;

const limitRedirect = (referer: string | null): string => {
  const locale = referer ? localeFromPath(new URL(referer).pathname) : 'es';
  return `/contacto/error?motivo=limite&idioma=${locale}`;
};

const rateLimitedAction = () => {
  const error = new ActionError({ code: 'TOO_MANY_REQUESTS', message: 'rateLimited' });
  return new Response(JSON.stringify({ ...error, message: error.message }), {
    status: error.status,
    headers: { 'Content-Type': 'application/json' },
  });
};

const contactRateLimit = defineMiddleware((context, next) => {
  if (context.request.method !== 'POST') {
    return next();
  }
  const action = invokedAction(context);
  const isAction = action?.name === ACTION_NAME;
  const isForm = isFormSubmission(context.url.pathname) || (isAction && action.fromForm);
  if (!isForm && !isAction) {
    return next();
  }
  const key = resolveClientKey(context.request.headers.get('x-forwarded-for'), context.clientAddress, TRUST_PROXY === 'true');
  if (contactRateLimiter.hit(key)) {
    return next();
  }
  return isForm ? context.redirect(limitRedirect(context.request.headers.get('referer')), 303) : rateLimitedAction();
});

export const onRequest = sequence(contactRateLimit, bookingRateLimit);

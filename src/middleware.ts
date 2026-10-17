import { ActionError } from 'astro:actions';
import { defineMiddleware } from 'astro:middleware';
import { TRUST_PROXY } from 'astro:env/server';
import { contactValidationMessages } from '@/actions/contactValidationMessages';
import { contactRateLimiter } from '@/infrastructure/rateLimit/contactRateLimiter';
import { resolveClientKey } from '@/infrastructure/rateLimit/resolveClientKey';

const FORM_PATH = '/contacto/enviar';
const ACTION_PATH_PREFIX = '/_actions/contact';
const LIMIT_REDIRECT = '/contacto/error?motivo=limite';

const isFormSubmission = (pathname: string) => pathname === FORM_PATH || pathname === `${FORM_PATH}/`;

const rateLimitedAction = () => {
  const error = new ActionError({ code: 'TOO_MANY_REQUESTS', message: contactValidationMessages.rateLimited });
  return new Response(JSON.stringify({ ...error, message: error.message }), {
    status: error.status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;
  const isForm = isFormSubmission(pathname);
  const isAction = pathname.startsWith(ACTION_PATH_PREFIX);
  if (context.request.method !== 'POST' || (!isForm && !isAction)) {
    return next();
  }
  const key = resolveClientKey(context.request.headers.get('x-forwarded-for'), context.clientAddress, TRUST_PROXY === 'true');
  if (contactRateLimiter.hit(key)) {
    return next();
  }
  return isForm ? context.redirect(LIMIT_REDIRECT, 303) : rateLimitedAction();
});

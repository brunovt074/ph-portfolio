import { actions, isInputError } from 'astro:actions';
import type { APIRoute } from 'astro';
import { parseLocale } from '@/domain/Locale';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const formData = await context.request.formData();
  const idioma = parseLocale(String(formData.get('idioma') ?? ''));
  const result = await context.callAction(actions.contact, formData);
  if (!result.error) {
    return context.redirect(`/${idioma}/contacto/enviado`, 303);
  }
  const reason = isInputError(result.error) ? `campos=${Object.keys(result.error.fields).join(',')}` : 'motivo=envio';
  return context.redirect(`/${idioma}/contacto/error?${reason}`, 303);
};

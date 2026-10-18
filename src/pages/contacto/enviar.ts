import { actions, isInputError } from 'astro:actions';
import type { APIRoute } from 'astro';
import { parseLocale } from '@/domain/Locale';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const formData = await context.request.formData();
  const idioma = parseLocale(formData.get('idioma')?.toString());
  const result = await context.callAction(actions.contact, formData);
  if (!result.error) {
    return context.redirect(`/contacto/enviado?idioma=${idioma}`, 303);
  }
  const query = isInputError(result.error)
    ? `campos=${Object.keys(result.error.fields).join(',')}&idioma=${idioma}`
    : `motivo=envio&idioma=${idioma}`;
  return context.redirect(`/contacto/error?${query}`, 303);
};

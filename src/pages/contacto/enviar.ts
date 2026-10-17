import { actions, isInputError } from 'astro:actions';
import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const result = await context.callAction(actions.contact, await context.request.formData());
  if (!result.error) {
    return context.redirect('/contacto/enviado', 303);
  }
  const query = isInputError(result.error) ? `campos=${Object.keys(result.error.fields).join(',')}` : 'motivo=envio';
  return context.redirect(`/contacto/error?${query}`, 303);
};

import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { parseLocale } from '@/domain/Locale';
import { MessageDeliveryError } from '@/domain/MessageDeliveryError';
import { sendContactMessage } from '@/infrastructure/contactContainer';

const COPY_INQUIRY_TYPE = 'Copia de autor';

const singleLineText = (max: number, field: string) =>
  z.string().trim().max(max, field).regex(/^[^\r\n]*$/, field).nullish().transform((value) => value ?? '');

export const contact = defineAction({
  accept: 'form',
  input: z
    .object({
      nombre: z.string({ error: 'nombre' }).trim().min(2, 'nombre').max(80, 'nombre'),
      email: z.string({ error: 'email' }).trim().max(200, 'email').pipe(z.email('email')),
      tipo: singleLineText(120, 'tipo'),
      mensaje: z.string({ error: 'mensaje' }).trim().min(10, 'mensaje').max(2000, 'mensaje'),
      copia: singleLineText(120, 'copia'),
      sitio_web: z.string().max(200).nullish().transform((value) => value ?? ''),
      idioma: z.string().nullish().transform((value) => parseLocale(value)),
    })
    .refine((input) => input.tipo !== COPY_INQUIRY_TYPE || input.copia !== '', { path: ['copia'], message: 'copia' }),
  handler: async (input) => {
    try {
      await sendContactMessage.execute({
        name: input.nombre,
        email: input.email,
        type: input.tipo,
        message: input.mensaje,
        copy: input.copia,
        website: input.sitio_web,
        locale: input.idioma,
      });
    } catch (error) {
      if (error instanceof MessageDeliveryError) {
        throw new ActionError({ code: 'SERVICE_UNAVAILABLE', message: 'unavailable' });
      }
      throw error;
    }
    return { sent: true };
  },
});

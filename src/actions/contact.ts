import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { MessageDeliveryError } from '@/domain/MessageDeliveryError';
import { sendContactMessage } from '@/infrastructure/contactContainer';
import { contactValidationMessages as messages } from './contactValidationMessages';

const COPY_INQUIRY_TYPE = 'Copia de autor';

const singleLineText = (max: number, message: string) =>
  z.string().trim().max(max, message).regex(/^[^\r\n]*$/, message).nullish().transform((value) => value ?? '');

export const contact = defineAction({
  accept: 'form',
  input: z.object({
    nombre: z.string({ error: messages.nombre }).trim().min(2, messages.nombre).max(80, messages.nombre),
    email: z.string({ error: messages.email }).trim().max(200, messages.email).pipe(z.email(messages.email)),
    tipo: singleLineText(120, messages.tipo),
    mensaje: z.string({ error: messages.mensaje }).trim().min(10, messages.mensaje).max(2000, messages.mensaje),
    copia: singleLineText(120, messages.copia),
    sitio_web: z.string().max(200).nullish().transform((value) => value ?? ''),
  }).refine((input) => input.tipo !== COPY_INQUIRY_TYPE || input.copia !== '', { path: ['copia'], message: messages.copia }),
  handler: async (input) => {
    try {
      await sendContactMessage.execute({
        name: input.nombre,
        email: input.email,
        type: input.tipo,
        message: input.mensaje,
        copy: input.copia,
        website: input.sitio_web,
      });
    } catch (error) {
      if (error instanceof MessageDeliveryError) {
        throw new ActionError({ code: 'SERVICE_UNAVAILABLE', message: messages.unavailable });
      }
      throw error;
    }
    return { sent: true };
  },
});

import { CONTACT_DELIVERY_MODE, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL, RESEND_API_KEY } from 'astro:env/server';
import { SendContactMessage } from '@/application/SendContactMessage';
import { createMessageSender } from './email/createMessageSender';

export const sendContactMessage = new SendContactMessage(
  createMessageSender({
    apiKey: RESEND_API_KEY,
    toEmail: CONTACT_TO_EMAIL,
    fromEmail: CONTACT_FROM_EMAIL,
    consoleDelivery: import.meta.env.DEV || CONTACT_DELIVERY_MODE === 'console',
  }),
);

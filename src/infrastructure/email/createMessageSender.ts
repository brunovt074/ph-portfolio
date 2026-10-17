import { Resend } from 'resend';
import type { MessageSender } from '@/domain/MessageSender';
import { ConsoleMessageSender } from './ConsoleMessageSender';
import type { MessageSenderConfig } from './MessageSenderConfig';
import { ResendMessageSender } from './ResendMessageSender';
import { UnavailableMessageSender } from './UnavailableMessageSender';

export const createMessageSender = ({ apiKey, toEmail, fromEmail, consoleDelivery }: MessageSenderConfig): MessageSender => {
  if (apiKey && toEmail && fromEmail) {
    return new ResendMessageSender(new Resend(apiKey), toEmail, fromEmail);
  }
  if (consoleDelivery) {
    return new ConsoleMessageSender();
  }
  return new UnavailableMessageSender();
};

import type { ContactMessage } from '@/domain/ContactMessage';
import { MessageDeliveryError } from '@/domain/MessageDeliveryError';
import type { MessageSender } from '@/domain/MessageSender';
import { formatContactEmail } from './formatContactEmail';
import type { ResendEmailClient } from './ResendEmailClient';

export class ResendMessageSender implements MessageSender {
  constructor(
    private readonly client: ResendEmailClient,
    private readonly toEmail: string,
    private readonly fromEmail: string,
  ) {}

  async send(message: ContactMessage): Promise<void> {
    const { subject, text } = formatContactEmail(message);
    const { error } = await this.client.emails.send({
      from: this.fromEmail,
      to: this.toEmail,
      replyTo: message.email,
      subject,
      text,
    });
    if (error) {
      throw new MessageDeliveryError(error.message);
    }
  }
}

import type { MessageSender } from '@/domain/MessageSender';
import type { ContactSubmission } from './inputs/ContactSubmission';

export class SendContactMessage {
  constructor(private readonly sender: MessageSender) {}

  async execute({ website, ...message }: ContactSubmission): Promise<void> {
    if (website.trim() !== '') {
      return;
    }
    await this.sender.send(message);
  }
}

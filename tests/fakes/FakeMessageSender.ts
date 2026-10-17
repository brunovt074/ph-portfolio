import type { ContactMessage } from '@/domain/ContactMessage';
import type { MessageSender } from '@/domain/MessageSender';

export class FakeMessageSender implements MessageSender {
  readonly sent: ContactMessage[] = [];

  async send(message: ContactMessage): Promise<void> {
    this.sent.push(message);
  }
}

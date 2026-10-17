import type { ContactMessage } from '@/domain/ContactMessage';
import type { MessageSender } from '@/domain/MessageSender';
import { formatContactEmail } from './formatContactEmail';

export class ConsoleMessageSender implements MessageSender {
  constructor(private readonly log: (line: string) => void = console.info) {}

  async send(message: ContactMessage): Promise<void> {
    const { subject, text } = formatContactEmail(message);
    this.log(`[contact] ${subject}\n${text}`);
  }
}

import type { ContactMessage } from './ContactMessage';

export interface MessageSender {
  send(message: ContactMessage): Promise<void>;
}

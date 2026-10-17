import type { MessageSender } from '@/domain/MessageSender';

export class UnexpectedFailureMessageSender implements MessageSender {
  async send(): Promise<void> {
    throw new TypeError('unexpected');
  }
}

import { MessageDeliveryError } from '@/domain/MessageDeliveryError';
import type { MessageSender } from '@/domain/MessageSender';

export class FailingMessageSender implements MessageSender {
  async send(): Promise<void> {
    throw new MessageDeliveryError('provider down');
  }
}

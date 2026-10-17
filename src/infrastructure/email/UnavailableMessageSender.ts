import { MessageDeliveryError } from '@/domain/MessageDeliveryError';
import type { MessageSender } from '@/domain/MessageSender';

export class UnavailableMessageSender implements MessageSender {
  async send(): Promise<void> {
    throw new MessageDeliveryError('email delivery is not configured');
  }
}

import type { ErrorReporter } from '@/domain/ErrorReporter';
import { MessageDeliveryError } from '@/domain/MessageDeliveryError';
import type { MessageSender } from '@/domain/MessageSender';
import type { ContactSubmission } from './inputs/ContactSubmission';

export class SendContactMessage {
  constructor(
    private readonly sender: MessageSender,
    private readonly errorReporter: ErrorReporter,
  ) {}

  async execute({ website, ...message }: ContactSubmission): Promise<void> {
    if (website.trim() !== '') {
      return;
    }
    try {
      await this.sender.send(message);
    } catch (error) {
      if (error instanceof MessageDeliveryError) {
        this.errorReporter.report(error);
      }
      throw error;
    }
  }
}

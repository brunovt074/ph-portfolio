import type { ErrorReporter } from '@/domain/ErrorReporter';
import type { MessageDeliveryError } from '@/domain/MessageDeliveryError';

export class ConsoleErrorReporter implements ErrorReporter {
  report(error: MessageDeliveryError): void {
    console.error('[contact] delivery failed', error.message);
  }
}

import type { ErrorReporter } from '@/domain/ErrorReporter';
import { MessageDeliveryError } from '@/domain/MessageDeliveryError';

export class ConsoleErrorReporter implements ErrorReporter {
  report(error: Error): void {
    if (error instanceof MessageDeliveryError) {
      console.error('[contact] delivery failed', error.message);
      return;
    }
    console.error(`[error] ${error.name}`, error.message);
  }
}

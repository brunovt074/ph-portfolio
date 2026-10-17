import type { ErrorReporter } from '@/domain/ErrorReporter';
import type { MessageDeliveryError } from '@/domain/MessageDeliveryError';

export class FakeErrorReporter implements ErrorReporter {
  readonly reported: MessageDeliveryError[] = [];

  report(error: MessageDeliveryError): void {
    this.reported.push(error);
  }
}

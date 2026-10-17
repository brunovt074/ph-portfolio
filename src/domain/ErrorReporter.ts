import type { MessageDeliveryError } from './MessageDeliveryError';

export interface ErrorReporter {
  report(error: MessageDeliveryError): void;
}

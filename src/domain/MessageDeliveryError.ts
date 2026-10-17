export class MessageDeliveryError extends Error {
  constructor(reason: string) {
    super(`Contact message could not be delivered: ${reason}`);
    this.name = 'MessageDeliveryError';
  }
}

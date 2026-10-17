export class BookingNotificationError extends Error {
  constructor(reason: string) {
    super(`Booking notification could not be delivered: ${reason}`);
    this.name = 'BookingNotificationError';
  }
}

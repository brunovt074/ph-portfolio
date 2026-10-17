export class CalendarUnavailableError extends Error {
  constructor(reason: string) {
    super(`Calendar is unavailable: ${reason}`);
    this.name = 'CalendarUnavailableError';
  }
}

export class CalendarConfigurationError extends Error {
  constructor(missing: string[]) {
    super(`Google Calendar is selected but these variables are missing: ${missing.join(', ')}`);
    this.name = 'CalendarConfigurationError';
  }
}

export interface CalendarProviderConfig {
  provider: string | undefined;
  calendarId: string | undefined;
  serviceAccountEmail: string | undefined;
  serviceAccountPrivateKey: string | undefined;
  timeZone: string;
}

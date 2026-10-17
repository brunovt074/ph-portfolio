import type { GoogleFreeBusyResponse } from './GoogleFreeBusyResponse';
import type { GoogleInsertedEvent } from './GoogleInsertedEvent';

export interface GoogleCalendarApi {
  freeBusy(body: Record<string, unknown>): Promise<GoogleFreeBusyResponse>;
  insertEvent(calendarId: string, body: Record<string, unknown>): Promise<GoogleInsertedEvent>;
  deleteEvent(calendarId: string, eventId: string): Promise<void>;
}

import type { GoogleCalendarApi } from '@/infrastructure/scheduling/google/GoogleCalendarApi';
import type { GoogleFreeBusyResponse } from '@/infrastructure/scheduling/google/GoogleFreeBusyResponse';
import type { GoogleInsertedEvent } from '@/infrastructure/scheduling/google/GoogleInsertedEvent';

export class FakeGoogleCalendarApi implements GoogleCalendarApi {
  readonly freeBusyBodies: Record<string, unknown>[] = [];
  readonly inserted: { calendarId: string; body: Record<string, unknown> }[] = [];
  readonly deleted: { calendarId: string; eventId: string }[] = [];

  constructor(
    private readonly freeBusyResponse: GoogleFreeBusyResponse = {},
    private readonly insertResponse: GoogleInsertedEvent = { id: 'google-event-1' },
  ) {}

  async freeBusy(body: Record<string, unknown>): Promise<GoogleFreeBusyResponse> {
    this.freeBusyBodies.push(body);
    return this.freeBusyResponse;
  }

  async insertEvent(calendarId: string, body: Record<string, unknown>): Promise<GoogleInsertedEvent> {
    this.inserted.push({ calendarId, body });
    return this.insertResponse;
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    this.deleted.push({ calendarId, eventId });
  }
}

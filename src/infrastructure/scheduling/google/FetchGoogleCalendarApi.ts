import { CalendarUnavailableError } from '@/domain/scheduling/CalendarUnavailableError';
import type { GoogleAccessTokenSource } from './GoogleAccessTokenSource';
import type { GoogleCalendarApi } from './GoogleCalendarApi';
import type { GoogleFreeBusyResponse } from './GoogleFreeBusyResponse';
import type { GoogleInsertedEvent } from './GoogleInsertedEvent';

const BASE_URL = 'https://www.googleapis.com/calendar/v3';

export class FetchGoogleCalendarApi implements GoogleCalendarApi {
  constructor(
    private readonly auth: GoogleAccessTokenSource,
    private readonly request: typeof fetch = fetch,
  ) {}

  freeBusy(body: Record<string, unknown>): Promise<GoogleFreeBusyResponse> {
    return this.send<GoogleFreeBusyResponse>('POST', '/freeBusy', body);
  }

  insertEvent(calendarId: string, body: Record<string, unknown>): Promise<GoogleInsertedEvent> {
    return this.send<GoogleInsertedEvent>('POST', `/calendars/${encodeURIComponent(calendarId)}/events`, body);
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    await this.send<null>('DELETE', `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`);
  }

  private async send<T>(method: string, path: string, body?: Record<string, unknown>): Promise<T> {
    try {
      const { token } = await this.auth.getAccessToken();
      if (!token) {
        throw new CalendarUnavailableError('Google did not return an access token');
      }
      const response = await this.request(`${BASE_URL}${path}`, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!response.ok) {
        throw new CalendarUnavailableError(`Google Calendar answered ${response.status}`);
      }
      return (response.status === 204 ? null : await response.json()) as T;
    } catch (error) {
      throw error instanceof CalendarUnavailableError ? error : new CalendarUnavailableError(error instanceof Error ? error.message : String(error));
    }
  }
}

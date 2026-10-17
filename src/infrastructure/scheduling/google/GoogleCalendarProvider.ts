import type { CalendarEvent } from '@/domain/scheduling/CalendarEvent';
import type { CalendarProvider } from '@/domain/scheduling/CalendarProvider';
import { CalendarUnavailableError } from '@/domain/scheduling/CalendarUnavailableError';
import type { TimeRange } from '@/domain/scheduling/TimeRange';
import type { GoogleCalendarApi } from './GoogleCalendarApi';

export class GoogleCalendarProvider implements CalendarProvider {
  readonly provider = 'google';

  constructor(
    private readonly api: GoogleCalendarApi,
    private readonly calendarId: string,
    private readonly timeZone: string,
  ) {}

  async busy(range: TimeRange): Promise<TimeRange[]> {
    const response = await this.api.freeBusy({
      timeMin: range.start.toISOString(),
      timeMax: range.end.toISOString(),
      timeZone: this.timeZone,
      items: [{ id: this.calendarId }],
    });
    const calendar = response.calendars?.[this.calendarId];
    if (!calendar || calendar.errors?.length) {
      throw new CalendarUnavailableError('freeBusy returned no data for the calendar');
    }
    return (calendar.busy ?? []).map((interval) => ({ start: new Date(interval.start), end: new Date(interval.end) }));
  }

  async createEvent(event: CalendarEvent): Promise<string> {
    const created = await this.api.insertEvent(this.calendarId, {
      summary: event.title,
      description: event.description,
      start: { dateTime: event.start.toISOString(), timeZone: this.timeZone },
      end: { dateTime: event.end.toISOString(), timeZone: this.timeZone },
      extendedProperties: { private: { bookingId: event.bookingId } },
    });
    if (!created.id) {
      throw new CalendarUnavailableError('Google did not return the event id');
    }
    return created.id;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.api.deleteEvent(this.calendarId, eventId);
  }
}

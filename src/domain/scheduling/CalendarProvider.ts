import type { CalendarEvent } from './CalendarEvent';
import type { TimeRange } from './TimeRange';

export interface CalendarProvider {
  readonly provider: string;
  busy(range: TimeRange): Promise<TimeRange[]>;
  createEvent(event: CalendarEvent): Promise<string>;
  deleteEvent(eventId: string): Promise<void>;
}

import type { CalendarEvent } from '@/domain/scheduling/CalendarEvent';
import type { CalendarProvider } from '@/domain/scheduling/CalendarProvider';
import type { TimeRange } from '@/domain/scheduling/TimeRange';

export class SimulatedCalendarProvider implements CalendarProvider {
  readonly provider = 'simulado';
  private readonly events = new Map<string, CalendarEvent>();
  private counter = 0;

  async busy(range: TimeRange): Promise<TimeRange[]> {
    return [...this.events.values()]
      .filter((event) => event.start < range.end && event.end > range.start)
      .map((event) => ({ start: event.start, end: event.end }));
  }

  async createEvent(event: CalendarEvent): Promise<string> {
    this.counter += 1;
    const eventId = `simevent_${this.counter}`;
    this.events.set(eventId, event);
    return eventId;
  }

  async deleteEvent(eventId: string): Promise<void> {
    this.events.delete(eventId);
  }
}

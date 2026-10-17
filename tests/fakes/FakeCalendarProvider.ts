import type { CalendarEvent } from '@/domain/scheduling/CalendarEvent';
import type { CalendarProvider } from '@/domain/scheduling/CalendarProvider';
import { CalendarUnavailableError } from '@/domain/scheduling/CalendarUnavailableError';
import type { TimeRange } from '@/domain/scheduling/TimeRange';

export class FakeCalendarProvider implements CalendarProvider {
  readonly provider = 'fake-calendar';
  readonly events: CalendarEvent[] = [];
  private blocked: TimeRange[] = [];
  private busyFailure = false;
  private createFailure = false;
  private crash = false;

  blocks(range: TimeRange): void {
    this.blocked.push(range);
  }

  goesDown(): void {
    this.busyFailure = true;
    this.createFailure = true;
  }

  crashes(): void {
    this.crash = true;
  }

  rejectsEventCreation(): void {
    this.createFailure = true;
  }

  async busy(range: TimeRange): Promise<TimeRange[]> {
    if (this.crash) {
      throw new Error('boom');
    }
    if (this.busyFailure) {
      throw new CalendarUnavailableError('down');
    }
    return this.blocked.filter((candidate) => candidate.start < range.end && candidate.end > range.start);
  }

  async createEvent(event: CalendarEvent): Promise<string> {
    if (this.createFailure) {
      throw new CalendarUnavailableError('down');
    }
    this.events.push(event);
    return `event-${this.events.length}`;
  }

  async deleteEvent(): Promise<void> {}
}

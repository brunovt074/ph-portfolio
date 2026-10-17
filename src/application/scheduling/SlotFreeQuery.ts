import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';
import type { TimeRange } from '@/domain/scheduling/TimeRange';

export interface SlotFreeQuery {
  settings: SchedulingSettings;
  range: TimeRange;
  now: Date;
  excludeBookingId: string;
}

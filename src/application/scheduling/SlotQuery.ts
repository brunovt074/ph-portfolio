import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';
import type { TimeRange } from '@/domain/scheduling/TimeRange';

export interface SlotQuery {
  settings: SchedulingSettings;
  durationMinutes: number;
  busy: TimeRange[];
  now: Date;
  from: string;
  to: string;
}

import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';

export interface FreeSlotsQuery {
  settings: SchedulingSettings;
  durationMinutes: number;
  from: string;
  to: string;
  now: Date;
}

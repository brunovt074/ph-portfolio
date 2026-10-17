import type { TimeRange } from '@/domain/scheduling/TimeRange';

export interface DaySlots {
  date: string;
  slots: TimeRange[];
}

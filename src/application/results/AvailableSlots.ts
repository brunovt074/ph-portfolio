import type { SchedulingMode } from './SchedulingMode';
import type { SlotDayView } from './SlotDayView';

export interface AvailableSlots {
  mode: SchedulingMode;
  days: SlotDayView[];
}

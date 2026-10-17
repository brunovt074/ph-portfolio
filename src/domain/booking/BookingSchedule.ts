import type { TimeSlot } from './TimeSlot';

export type BookingSchedule =
  | { kind: 'slot'; start: Date; end: Date }
  | { kind: 'request'; preferredDate: string; timeSlot: TimeSlot };

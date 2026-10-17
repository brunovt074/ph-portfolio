import type { WeeklyWindow } from './WeeklyWindow';

export interface SchedulingSettings {
  timeZone: string;
  windows: WeeklyWindow[];
  slotStepMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  horizonDays: number;
  holdMinutes: number;
}

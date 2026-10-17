import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';

export const aSchedulingSettings = (overrides: Partial<SchedulingSettings> = {}): SchedulingSettings => ({
  timeZone: 'America/Argentina/Buenos_Aires',
  windows: [],
  slotStepMinutes: 30,
  bufferMinutes: 30,
  minNoticeHours: 48,
  horizonDays: 90,
  holdMinutes: 30,
  ...overrides,
});

export const tuesdayAndThursdayWindows = (): SchedulingSettings['windows'] => [
  { weekday: 2, from: '10:00', to: '13:00' },
  { weekday: 2, from: '15:00', to: '19:00' },
  { weekday: 4, from: '10:00', to: '13:00' },
  { weekday: 4, from: '15:00', to: '19:00' },
];

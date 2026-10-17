export const scheduleKinds = ['slot', 'request'] as const;
export type ScheduleKind = (typeof scheduleKinds)[number];

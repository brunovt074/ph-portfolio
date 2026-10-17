import type { TimeRange } from '@/domain/scheduling/TimeRange';

const MINUTE_IN_MILLISECONDS = 60_000;

export const overlapsWithBuffer = (candidate: TimeRange, busy: TimeRange, bufferMinutes: number): boolean => {
  const buffer = bufferMinutes * MINUTE_IN_MILLISECONDS;
  return candidate.start.getTime() < busy.end.getTime() + buffer && candidate.end.getTime() + buffer > busy.start.getTime();
};

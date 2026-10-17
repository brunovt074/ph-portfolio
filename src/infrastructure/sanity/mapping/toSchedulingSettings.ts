import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';
import type { Weekday } from '@/domain/scheduling/Weekday';
import type { WeeklyWindow } from '@/domain/scheduling/WeeklyWindow';
import type { SanitySchedulingDocument } from '../documents/SanitySchedulingDocument';
import type { SanitySchedulingWindow } from '../documents/SanitySchedulingWindow';

const CLOCK_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const toWindow = (window: SanitySchedulingWindow): WeeklyWindow[] => {
  const { dia, desde, hasta } = window;
  const valid =
    Number.isInteger(dia) && (dia as number) >= 1 && (dia as number) <= 7 && CLOCK_PATTERN.test(desde ?? '') && CLOCK_PATTERN.test(hasta ?? '') && (desde as string) < (hasta as string);
  return valid ? [{ weekday: dia as Weekday, from: desde as string, to: hasta as string }] : [];
};

export const toSchedulingSettings = (document: SanitySchedulingDocument | null): SchedulingSettings => ({
  timeZone: document?.zonaHoraria ?? 'America/Argentina/Buenos_Aires',
  windows: (document?.ventanas ?? []).flatMap(toWindow),
  slotStepMinutes: document?.pasoMinutos ?? 30,
  bufferMinutes: document?.margenMinutos ?? 30,
  minNoticeHours: document?.anticipacionHoras ?? 48,
  horizonDays: document?.horizonteDias ?? 90,
  holdMinutes: document?.retencionMinutos ?? 30,
});

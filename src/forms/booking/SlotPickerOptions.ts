import type { BookingTexts } from './BookingTexts';

export interface SlotPickerOptions {
  texts: BookingTexts;
  endpoint: string;
  timeZone: string;
  localeTag: string;
  horizonDays: number;
  isTaken: (slotStart: string) => boolean;
  onFallback: (message: string) => void;
}

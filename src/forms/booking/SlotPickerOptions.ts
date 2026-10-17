import type { BookingTexts } from './BookingTexts';

export interface SlotPickerOptions {
  texts: BookingTexts;
  endpoint: string;
  timeZone: string;
  localeTag: string;
  onFallback: () => void;
}

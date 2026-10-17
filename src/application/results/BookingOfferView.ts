import type { SchedulingMode } from './SchedulingMode';

export interface BookingOfferView {
  slug: string;
  title: string;
  description: string;
  totalCents: number | null;
  depositCents: number | null;
  depositPercent: number;
  durationMinutes: number | null;
  fullPaymentAvailable: boolean;
  scheduling: SchedulingMode;
  bookable: boolean;
}

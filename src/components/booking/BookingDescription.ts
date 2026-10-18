import type { BookingAction } from './BookingAction';

export interface BookingDescription {
  title: string;
  lead: string;
  note: string;
  action: BookingAction;
}

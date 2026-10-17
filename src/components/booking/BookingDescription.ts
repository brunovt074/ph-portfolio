export type BookingAction = 'refresh' | 'retry' | 'new' | 'contact' | 'none';

export interface BookingDescription {
  title: string;
  lead: string;
  note: string;
  action: BookingAction;
}

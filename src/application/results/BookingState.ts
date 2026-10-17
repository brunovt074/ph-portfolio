export type BookingState =
  | 'confirmed'
  | 'pending_payment'
  | 'payment_rejected'
  | 'awaiting_payment'
  | 'needs_rescheduling'
  | 'expired'
  | 'cancelled';

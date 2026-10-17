export type CreateBookingError =
  | 'offer_not_found'
  | 'offer_unavailable'
  | 'invalid_date'
  | 'slot_required'
  | 'slot_taken'
  | 'calendar_unavailable'
  | 'gateway_unavailable';

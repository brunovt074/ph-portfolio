export const bookingStatuses = ['awaiting_payment', 'confirmed', 'needs_rescheduling', 'cancelled'] as const;
export type BookingStatus = (typeof bookingStatuses)[number];

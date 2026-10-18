import type { bookings } from './schema';

export type BookingRow = typeof bookings.$inferSelect;

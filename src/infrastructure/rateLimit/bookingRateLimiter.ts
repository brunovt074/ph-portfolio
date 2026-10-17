import { SlidingWindowLimiter } from './SlidingWindowLimiter';

const BOOKING_LIMIT = 5;
const BOOKING_WINDOW_MS = 10 * 60 * 1000;

export const bookingRateLimiter = new SlidingWindowLimiter(BOOKING_LIMIT, BOOKING_WINDOW_MS);

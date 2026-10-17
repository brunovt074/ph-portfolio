import { SlidingWindowLimiter } from './SlidingWindowLimiter';

const SLOTS_LIMIT = 60;
const SLOTS_WINDOW_MS = 60 * 1000;

export const slotsRateLimiter = new SlidingWindowLimiter(SLOTS_LIMIT, SLOTS_WINDOW_MS);

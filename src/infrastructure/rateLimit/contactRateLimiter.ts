import { SlidingWindowLimiter } from './SlidingWindowLimiter';

const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 10 * 60 * 1000;

export const contactRateLimiter = new SlidingWindowLimiter(CONTACT_LIMIT, CONTACT_WINDOW_MS);

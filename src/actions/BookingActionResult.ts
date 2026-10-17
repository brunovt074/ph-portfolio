import type { BookingProblem } from './BookingProblem';

export type BookingActionResult = { status: 'created'; checkoutUrl: string } | { status: 'rejected'; problem: BookingProblem };

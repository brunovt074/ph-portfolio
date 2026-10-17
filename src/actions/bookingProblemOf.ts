import type { CreateBookingError } from '@/application/results/CreateBookingError';
import type { BookingProblem } from './BookingProblem';

const problems: Record<CreateBookingError, BookingProblem> = {
  offer_not_found: 'offer',
  offer_unavailable: 'offer',
  invalid_date: 'date',
  slot_required: 'slot_required',
  slot_taken: 'slot_taken',
  calendar_unavailable: 'calendar',
  gateway_unavailable: 'gateway',
};

export const bookingProblemOf = (error: CreateBookingError): BookingProblem => problems[error];

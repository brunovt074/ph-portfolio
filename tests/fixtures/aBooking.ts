import type { Booking } from '@/domain/booking/Booking';

export const aBooking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 'booking-1',
  offerSlug: 'maternidad',
  offerTitle: 'Maternidad',
  totalCents: 9_500_000,
  depositCents: 4_750_000,
  currency: 'USD',
  paymentPlan: 'deposit',
  schedule: { kind: 'request', preferredDate: '2026-11-20', timeSlot: 'morning' },
  calendarEventId: null,
  customer: { name: 'Camila Ríos', email: 'camila@example.com', phone: '+54 9 341 000 0000' },
  notes: '',
  status: 'awaiting_payment',
  expiresAt: new Date('2026-10-19T15:00:00Z'),
  createdAt: new Date('2026-10-17T15:00:00Z'),
  updatedAt: new Date('2026-10-17T15:00:00Z'),
  ...overrides,
});

export const aSlotBooking = (overrides: Partial<Booking> = {}): Booking =>
  aBooking({
    schedule: { kind: 'slot', start: new Date('2026-10-22T13:00:00Z'), end: new Date('2026-10-22T14:30:00Z') },
    expiresAt: new Date('2026-10-17T15:30:00Z'),
    ...overrides,
  });

import type { CreateBookingInput } from '@/application/inputs/CreateBookingInput';

export const aCreateBookingInput = (overrides: Partial<CreateBookingInput> = {}): CreateBookingInput => ({
  offerSlug: 'maternidad',
  paymentPlan: 'deposit',
  preferredDate: '2026-11-20',
  timeSlot: 'morning',
  name: 'Camila Ríos',
  email: 'camila@example.com',
  phone: '+54 9 341 000 0000',
  notes: 'Prefiero luz natural',
  ...overrides,
});

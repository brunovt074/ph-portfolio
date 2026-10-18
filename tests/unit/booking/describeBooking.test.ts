import { describe, expect, it } from 'vitest';
import type { BookingStatusView } from '@/application/results/BookingStatusView';
import { describeBooking } from '@/components/booking/describeBooking';
import { defaultSiteTexts } from '@/infrastructure/texts/defaults/defaultSiteTexts';

const texts = defaultSiteTexts.es.booking;
const zone = 'America/Argentina/Buenos_Aires';

const view = (overrides: Partial<BookingStatusView> = {}): BookingStatusView => ({
  id: 'b1',
  offerSlug: 'maternidad',
  offerTitle: 'Maternidad',
  paymentPlan: 'deposit',
  schedule: { kind: 'request', preferredDate: '2026-11-20', timeSlot: 'any' },
  totalCents: 9_500_000,
  depositCents: 4_750_000,
  paidCents: 0,
  balanceCents: 9_500_000,
  firstName: 'Camila',
  state: 'confirmed',
  expiresAt: new Date('2026-10-19T17:30:00Z'),
  ...overrides,
});

describe('describeBooking', () => {
  it('confirms a deposit by request without promising a time', () => {
    expect(describeBooking(view(), texts, 'es-AR', zone).lead).toContain('Recibí tu seña, Camila');
  });

  it('confirms a full payment by request', () => {
    expect(describeBooking(view({ paymentPlan: 'full' }), texts, 'es-AR', zone).lead).toContain('Recibí el pago completo, Camila');
  });

  it('confirms a turn with its exact day and time', () => {
    const start = new Date('2026-10-22T13:00:00Z');
    const lead = describeBooking(view({ schedule: { kind: 'slot', start, end: new Date('2026-10-22T14:30:00Z') } }), texts, 'es-AR', zone).lead;
    expect(lead).toContain('a las 10:00');
    const full = describeBooking(view({ paymentPlan: 'full', schedule: { kind: 'slot', start, end: start } }), texts, 'es-AR', zone).lead;
    expect(full).toContain('pago completo');
  });

  it('explains a turn that was taken while paying', () => {
    expect(describeBooking(view({ state: 'needs_rescheduling' }), texts, 'es-AR', zone).title).toBe(texts.reschedulingTitle);
  });

  it('offers refresh, new booking and contact for the other states', () => {
    expect(describeBooking(view({ state: 'pending_payment' }), texts, 'es-AR', zone).action).toBe('refresh');
    expect(describeBooking(view({ state: 'expired' }), texts, 'es-AR', zone).action).toBe('new');
    expect(describeBooking(view({ state: 'cancelled' }), texts, 'es-AR', zone).action).toBe('contact');
  });

  it('offers a retry and the hold time of a turn when the payment did not complete', () => {
    const slot = { kind: 'slot' as const, start: new Date('2026-10-22T13:00:00Z'), end: new Date('2026-10-22T14:30:00Z') };
    const retry = describeBooking(view({ state: 'payment_rejected', schedule: slot }), texts, 'es-AR', zone);
    expect(retry.action).toBe('retry');
    expect(retry.note).toBe('Tu turno queda retenido hasta las 14:30.');
  });

  it('does not say nothing was charged while the payment confirmation is still pending', () => {
    const awaiting = describeBooking(view({ state: 'awaiting_payment' }), texts, 'es-AR', zone);
    expect(awaiting.title).toBe(texts.awaitingTitle);
    expect(awaiting.lead).toContain('Todavía no recibí la confirmación del pago');
    expect(awaiting.lead).not.toContain('No se cobró nada');
    expect(awaiting.note).toBe('');
    expect(awaiting.action).toBe('refresh_retry');
  });
});

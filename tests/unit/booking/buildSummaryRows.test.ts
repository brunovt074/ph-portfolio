import { describe, expect, it } from 'vitest';
import type { BookingStatusView } from '@/application/results/BookingStatusView';
import { buildSummaryRows } from '@/components/booking/buildSummaryRows';
import { defaultSiteTexts } from '@/infrastructure/texts/defaults/defaultSiteTexts';

const texts = defaultSiteTexts.es.booking;
const zone = 'America/Argentina/Buenos_Aires';
const slot = { kind: 'slot' as const, start: new Date('2026-10-20T13:00:00Z'), end: new Date('2026-10-20T14:30:00Z') };

const view = (overrides: Partial<BookingStatusView> = {}): BookingStatusView => ({
  id: 'b1',
  offerSlug: 'maternidad',
  offerTitle: 'Maternidad',
  paymentPlan: 'deposit',
  schedule: slot,
  totalCents: 9_500_000,
  depositCents: 4_750_000,
  paidCents: 4_750_000,
  balanceCents: 4_750_000,
  firstName: 'Camila',
  state: 'confirmed',
  expiresAt: new Date('2026-10-19T17:30:00Z'),
  ...overrides,
});

const labels = (rows: { label: string }[]) => rows.map((row) => row.label);

describe('buildSummaryRows', () => {
  it('lists the booked day and time with the payment and the balance of a confirmed turn', () => {
    expect(labels(buildSummaryRows(view(), texts, 'es-AR', zone))).toEqual([
      texts.summarySession,
      texts.summaryDate,
      texts.summaryTime,
      texts.summaryTotal,
      texts.summaryPaid,
      texts.summaryBalance,
    ]);
  });

  it('shows the proposed date and frame of a booking by request', () => {
    const rows = buildSummaryRows(view({ schedule: { kind: 'request', preferredDate: '2026-11-20', timeSlot: 'afternoon' }, paidCents: 0 }), texts, 'es-AR', zone);
    expect(labels(rows)).toEqual([texts.summarySession, texts.summaryProposedDate, texts.summaryFrame, texts.summaryTotal]);
    expect(rows[2]?.value).toBe(texts.frameAfternoon);
  });

  it('does not list the lost turn as if it were booked when it needs rescheduling', () => {
    const rows = buildSummaryRows(view({ state: 'needs_rescheduling' }), texts, 'es-AR', zone);
    expect(labels(rows)).toEqual([texts.summarySession, texts.summaryTotal, texts.summaryPaid, texts.summaryBalance]);
  });

  it('omits the balance once everything is paid', () => {
    const rows = buildSummaryRows(view({ paidCents: 9_500_000, balanceCents: 0 }), texts, 'es-AR', zone);
    expect(labels(rows)).not.toContain(texts.summaryBalance);
  });
});

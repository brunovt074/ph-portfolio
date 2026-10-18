import type { BookingStatusView } from '@/application/results/BookingStatusView';
import type { SiteTexts } from '@/domain/SiteTexts';
import { formatDay } from '@/formatting/formatDay';
import { formatInstantDay } from '@/formatting/formatInstantDay';
import { formatInstantTime } from '@/formatting/formatInstantTime';
import { formatMoney } from '@/formatting/formatMoney';
import type { SummaryRow } from './SummaryRow';

const scheduleRows = (view: BookingStatusView, texts: SiteTexts['booking'], localeTag: string, timeZone: string): SummaryRow[] => {
  if (view.state === 'needs_rescheduling') {
    return [];
  }
  if (view.schedule.kind === 'slot') {
    return [
      { label: texts.summaryDate, value: formatInstantDay(view.schedule.start, localeTag, timeZone) },
      { label: texts.summaryTime, value: formatInstantTime(view.schedule.start, localeTag, timeZone) },
    ];
  }
  const frameLabels = { morning: texts.frameMorning, afternoon: texts.frameAfternoon, any: texts.frameAny };
  return [
    { label: texts.summaryProposedDate, value: formatDay(view.schedule.preferredDate, localeTag) },
    { label: texts.summaryFrame, value: frameLabels[view.schedule.timeSlot] },
  ];
};

export const buildSummaryRows = (view: BookingStatusView, texts: SiteTexts['booking'], localeTag: string, timeZone: string): SummaryRow[] => {
  const rows: SummaryRow[] = [{ label: texts.summarySession, value: view.offerTitle }, ...scheduleRows(view, texts, localeTag, timeZone)];
  rows.push({ label: texts.summaryTotal, value: formatMoney(view.totalCents, localeTag) });
  if (view.paidCents > 0) {
    rows.push({ label: texts.summaryPaid, value: formatMoney(view.paidCents, localeTag) });
  }
  if (view.paidCents > 0 && view.balanceCents > 0) {
    rows.push({ label: texts.summaryBalance, value: formatMoney(view.balanceCents, localeTag) });
  }
  return rows;
};

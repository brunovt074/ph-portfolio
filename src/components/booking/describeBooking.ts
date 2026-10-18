import type { BookingStatusView } from '@/application/results/BookingStatusView';
import { formatText } from '@/domain/formatText';
import type { SiteTexts } from '@/domain/SiteTexts';
import { formatInstantDay } from '@/formatting/formatInstantDay';
import { formatInstantTime } from '@/formatting/formatInstantTime';
import type { BookingDescription } from './BookingDescription';

type BookingTexts = SiteTexts['booking'];

const confirmedLead = (view: BookingStatusView, texts: BookingTexts, localeTag: string, timeZone: string): string => {
  const name = view.firstName;
  if (view.schedule.kind === 'slot') {
    const date = formatInstantDay(view.schedule.start, localeTag, timeZone);
    const time = formatInstantTime(view.schedule.start, localeTag, timeZone);
    return formatText(view.paymentPlan === 'full' ? texts.confirmedFullSlotLead : texts.confirmedDepositSlotLead, { name, date, time });
  }
  return formatText(view.paymentPlan === 'full' ? texts.confirmedFullRequestLead : texts.confirmedDepositRequestLead, { name });
};

const retryNote = (view: BookingStatusView, texts: BookingTexts, localeTag: string, timeZone: string): string =>
  view.schedule.kind === 'slot' ? formatText(texts.slotHold, { time: formatInstantTime(view.expiresAt, localeTag, timeZone) }) : '';

export const describeBooking = (view: BookingStatusView, texts: BookingTexts, localeTag: string, timeZone: string): BookingDescription => {
  switch (view.state) {
    case 'confirmed':
      return { title: texts.confirmedTitle, lead: confirmedLead(view, texts, localeTag, timeZone), note: '', action: 'none' };
    case 'needs_rescheduling':
      return { title: texts.reschedulingTitle, lead: texts.reschedulingLead, note: '', action: 'none' };
    case 'pending_payment':
      return { title: texts.pendingTitle, lead: texts.pendingLead, note: '', action: 'refresh' };
    case 'expired':
      return { title: texts.expiredTitle, lead: texts.expiredLead, note: '', action: 'new' };
    case 'cancelled':
      return { title: texts.cancelledTitle, lead: texts.cancelledLead, note: '', action: 'contact' };
    case 'payment_rejected':
    case 'awaiting_payment': {
      const expires = `${formatInstantDay(view.expiresAt, localeTag, timeZone)}, ${formatInstantTime(view.expiresAt, localeTag, timeZone)}`;
      const awaiting = view.state === 'awaiting_payment';
      return {
        title: awaiting ? texts.awaitingTitle : texts.failedTitle,
        lead: formatText(awaiting ? texts.awaitingLead : texts.failedLead, { expires }),
        note: retryNote(view, texts, localeTag, timeZone),
        action: awaiting ? 'refresh_retry' : 'retry',
      };
    }
  }
};

import { applyScheduleMode } from './scheduleMode';
import { findSelectedOffer } from './findSelectedOffer';
import { SlotPicker } from './SlotPicker';
import type { BookingTexts } from './BookingTexts';
import { updateAmounts } from './updateAmounts';

export class BookingFormController {
  readonly picker: SlotPicker | null;
  readonly texts: BookingTexts;
  readonly localeTag: string;

  constructor(readonly form: HTMLFormElement) {
    this.texts = JSON.parse(form.dataset['texts'] ?? '{}') as BookingTexts;
    this.localeTag = form.dataset['localeTag'] ?? 'es-AR';
    const panel = form.querySelector<HTMLElement>('[data-slot-picker]');
    this.picker = panel
      ? new SlotPicker(panel, {
          texts: this.texts,
          endpoint: form.dataset['slotsEndpoint'] ?? '',
          timeZone: form.dataset['timeZone'] ?? 'UTC',
          localeTag: this.localeTag,
          onFallback: () => applyScheduleMode(form, 'request'),
        })
      : null;
  }

  refresh(): void {
    updateAmounts(this.form, this.texts, this.localeTag);
    const offer = findSelectedOffer(this.form);
    if (!offer) {
      applyScheduleMode(this.form, 'choose');
      return;
    }
    if (offer.scheduling === 'request' || !this.picker) {
      applyScheduleMode(this.form, 'request');
      return;
    }
    const previousMode = this.form.dataset['scheduleMode'];
    applyScheduleMode(this.form, 'slots');
    if (this.picker.currentOffer() !== offer.slug || previousMode !== 'slots') {
      this.picker.start(offer.slug);
    }
  }
}

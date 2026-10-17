import { formatText } from '@/domain/formatText';
import { formatMoney } from '@/formatting/formatMoney';
import type { BookingTexts } from './BookingTexts';
import { findSelectedOffer } from './findSelectedOffer';

const chosenPlan = (form: HTMLFormElement): 'deposit' | 'full' =>
  form.querySelector<HTMLInputElement>('input[name="plan"]:checked')?.value === 'full' ? 'full' : 'deposit';

export const updateAmounts = (form: HTMLFormElement, texts: BookingTexts, localeTag: string): void => {
  const offer = findSelectedOffer(form);
  const summary = form.querySelector<HTMLElement>('[data-summary]');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!offer) {
    if (summary) {
      summary.textContent = texts.summaryEmpty;
    }
    if (button) {
      button.textContent = texts.submitIdle;
    }
    return;
  }
  const amounts = { deposit: formatMoney(offer.depositCents, localeTag), full: formatMoney(offer.totalCents, localeTag) };
  form.querySelectorAll<HTMLElement>('[data-plan-label]').forEach((label) => {
    const plan = label.dataset['planLabel'] === 'full' ? 'full' : 'deposit';
    label.textContent = formatText(label.dataset['withAmount'] ?? '', { percent: offer.depositPercent, amount: amounts[plan] });
  });
  const plan = chosenPlan(form);
  if (summary) {
    summary.textContent = formatText(plan === 'full' ? texts.summaryFull : texts.summaryDeposit, { amount: amounts[plan] });
  }
  if (button) {
    button.textContent = formatText(texts.submitAmount, { amount: amounts[plan] });
  }
};

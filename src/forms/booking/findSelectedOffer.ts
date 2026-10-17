import type { SelectedOffer } from './SelectedOffer';

export const findSelectedOffer = (form: HTMLFormElement): SelectedOffer | null => {
  const input = form.querySelector<HTMLInputElement>('input[name="sesion"]:checked');
  if (!input) {
    return null;
  }
  return {
    slug: input.value,
    totalCents: Number(input.dataset['total']),
    depositCents: Number(input.dataset['deposit']),
    depositPercent: Number(input.dataset['percent']),
    scheduling: input.dataset['scheduling'] === 'slots' ? 'slots' : 'request',
  };
};

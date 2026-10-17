import { addDays, todayIn } from './dayMath';

const MIN_LEAD_DAYS = 2;
const MAX_LEAD_DAYS = 365;

export const setDateBounds = (form: HTMLFormElement, timeZone: string): void => {
  const input = form.querySelector<HTMLInputElement>('input[name="fecha"]');
  if (!input) {
    return;
  }
  const today = todayIn(timeZone);
  input.min = addDays(today, MIN_LEAD_DAYS);
  input.max = addDays(today, MAX_LEAD_DAYS);
};

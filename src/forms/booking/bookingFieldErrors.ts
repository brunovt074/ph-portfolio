const targetOf = (form: HTMLFormElement, name: string): HTMLElement | null => form.querySelector<HTMLElement>(`[data-field="${name}"]`);

export const showBookingFieldError = (form: HTMLFormElement, name: string, message: string): boolean => {
  const target = targetOf(form, name);
  const error = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
  if (!target || !error) {
    return false;
  }
  target.setAttribute('aria-invalid', 'true');
  error.textContent = message;
  error.hidden = false;
  return true;
};

export const focusFirstInvalidField = (form: HTMLFormElement): void => {
  const target = form.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (!target) {
    return;
  }
  const control = target.matches('input, textarea, select') ? target : target.querySelector<HTMLElement>('input:not(:disabled)');
  (control ?? target).focus();
};

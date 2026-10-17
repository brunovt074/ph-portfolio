import type { FieldName } from './FieldName';

const fieldOf = (form: HTMLFormElement, name: string): HTMLElement | null => form.querySelector<HTMLElement>(`[name="${name}"]`);
const errorOf = (form: HTMLFormElement, name: string): HTMLElement | null => form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);

export const clearFieldErrors = (form: HTMLFormElement): void => {
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((error) => {
    error.textContent = '';
    error.hidden = true;
  });
  form.querySelectorAll<HTMLElement>('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'));
};

export const showFieldError = (form: HTMLFormElement, name: FieldName, message: string): boolean => {
  const field = fieldOf(form, name);
  const error = errorOf(form, name);
  if (!field || !error) {
    return false;
  }
  field.setAttribute('aria-invalid', 'true');
  error.textContent = message;
  error.hidden = false;
  return true;
};

export const focusFirstInvalid = (form: HTMLFormElement): void => {
  form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
};

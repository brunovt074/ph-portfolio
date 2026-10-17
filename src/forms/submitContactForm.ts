import { actions, isInputError } from 'astro:actions';
import { clearFieldErrors, focusFirstInvalid, showFieldError } from './fieldErrors';
import type { FieldName } from './FieldName';
import { preselectContactForm } from './preselectContactForm';

const SUCCESS_MESSAGE = '¡Gracias! Te respondo dentro de las próximas 48 horas.';
const FIELD_ERRORS_MESSAGE = 'Revisá los campos marcados y volvé a enviar.';
const GENERIC_ERROR_MESSAGE = 'No pudimos enviar tu consulta. Probá de nuevo en unos minutos o escribime por email.';
const SENDING_LABEL = 'Enviando…';

const setStatus = (form: HTMLFormElement, state: 'success' | 'error', message: string): void => {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  if (!status) {
    return;
  }
  status.dataset.state = state;
  status.textContent = message;
};

const showInputErrors = (form: HTMLFormElement, fields: Record<string, string[] | undefined>): void => {
  Object.entries(fields).forEach(([name, messages]) => {
    showFieldError(form, name as FieldName, (messages ?? []).join(' '));
  });
  setStatus(form, 'error', FIELD_ERRORS_MESSAGE);
  focusFirstInvalid(form);
};

const deliver = async (form: HTMLFormElement): Promise<void> => {
  const { error } = await actions.contact(new FormData(form));
  if (!error) {
    form.reset();
    preselectContactForm(form);
    setStatus(form, 'success', SUCCESS_MESSAGE);
    return;
  }
  if (isInputError(error)) {
    showInputErrors(form, error.fields);
    return;
  }
  setStatus(form, 'error', error.message || GENERIC_ERROR_MESSAGE);
};

export const submitContactForm = async (form: HTMLFormElement): Promise<void> => {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const label = button?.textContent ?? '';
  clearFieldErrors(form);
  setStatus(form, 'success', '');
  if (button) {
    button.disabled = true;
    button.textContent = SENDING_LABEL;
  }
  try {
    await deliver(form);
  } catch {
    setStatus(form, 'error', GENERIC_ERROR_MESSAGE);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = label;
    }
  }
};

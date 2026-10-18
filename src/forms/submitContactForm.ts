import { actions, isInputError } from 'astro:actions';
import type { SiteTexts } from '@/domain/SiteTexts';
import { clearFieldErrors, focusFirstInvalid, showFieldError } from './fieldErrors';
import type { FieldName } from './FieldName';
import { preselectContactForm } from './preselectContactForm';

type ContactTexts = SiteTexts['contact'];

const errorKeyOf: Record<FieldName, keyof ContactTexts> = {
  nombre: 'errorNombre',
  email: 'errorEmail',
  tipo: 'errorTipo',
  mensaje: 'errorMensaje',
  copia: 'errorCopia',
};

const readMessages = (form: HTMLFormElement): ContactTexts => JSON.parse(form.dataset.messages ?? '{}') as ContactTexts;

const setStatus = (form: HTMLFormElement, state: 'success' | 'error', message: string): void => {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  if (!status) {
    return;
  }
  status.dataset.state = state;
  status.textContent = message;
};

const showInputErrors = (form: HTMLFormElement, fields: Record<string, string[] | undefined>): void => {
  const messages = readMessages(form);
  Object.entries(fields).forEach(([name]) => {
    const key = errorKeyOf[name as FieldName];
    showFieldError(form, name as FieldName, key ? messages[key] : messages.genericError);
  });
  setStatus(form, 'error', messages.fieldErrors);
  focusFirstInvalid(form);
};

const messageFor = (messages: ContactTexts, error: { code: string; message: string }): string => {
  if (error.code === 'SERVICE_UNAVAILABLE') {
    return messages.unavailable;
  }
  if (error.code === 'TOO_MANY_REQUESTS') {
    return messages.rateLimited;
  }
  return messages.genericError;
};

const deliver = async (form: HTMLFormElement): Promise<void> => {
  const messages = readMessages(form);
  const { error } = await actions.contact(new FormData(form));
  if (!error) {
    form.reset();
    preselectContactForm(form);
    setStatus(form, 'success', messages.success);
    return;
  }
  if (isInputError(error)) {
    showInputErrors(form, error.fields);
    return;
  }
  setStatus(form, 'error', messageFor(messages, error));
};

export const submitContactForm = async (form: HTMLFormElement): Promise<void> => {
  const messages = readMessages(form);
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const label = button?.textContent ?? '';
  clearFieldErrors(form);
  setStatus(form, 'success', '');
  if (button) {
    button.disabled = true;
    button.textContent = messages.sending;
  }
  try {
    await deliver(form);
  } catch {
    setStatus(form, 'error', messages.genericError);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = label;
    }
  }
};

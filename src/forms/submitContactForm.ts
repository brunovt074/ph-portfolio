import { actions, isInputError } from 'astro:actions';
import type { SiteTexts } from '@/domain/SiteTexts';
import { clearFieldErrors, focusFirstInvalid, showFieldError } from './fieldErrors';
import { fieldErrorKeys } from './fieldErrorKeys';
import type { FieldName } from './FieldName';
import { preselectContactForm } from './preselectContactForm';
import { readFormMessages } from './readFormMessages';

const setStatus = (form: HTMLFormElement, state: 'success' | 'error', message: string): void => {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  if (!status) {
    return;
  }
  status.dataset.state = state;
  status.textContent = message;
};

const showInputErrors = (form: HTMLFormElement, texts: SiteTexts['contact'], fields: Record<string, string[] | undefined>): void => {
  Object.keys(fields).forEach((name) => {
    showFieldError(form, name as FieldName, texts[fieldErrorKeys[name as FieldName]]);
  });
  setStatus(form, 'error', texts.fieldErrors);
  focusFirstInvalid(form);
};

const messageFor = (texts: SiteTexts['contact'], error: { code: string }): string => {
  if (error.code === 'SERVICE_UNAVAILABLE') {
    return texts.unavailable;
  }
  if (error.code === 'TOO_MANY_REQUESTS') {
    return texts.rateLimited;
  }
  return texts.genericError;
};

const deliver = async (form: HTMLFormElement, texts: SiteTexts['contact']): Promise<void> => {
  const { error } = await actions.contact(new FormData(form));
  if (!error) {
    form.reset();
    preselectContactForm(form);
    setStatus(form, 'success', texts.success);
    return;
  }
  if (isInputError(error)) {
    showInputErrors(form, texts, error.fields);
    return;
  }
  setStatus(form, 'error', messageFor(texts, error));
};

export const submitContactForm = async (form: HTMLFormElement): Promise<void> => {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const texts = readFormMessages(form);
  const label = button?.textContent ?? '';
  clearFieldErrors(form);
  setStatus(form, 'success', '');
  if (button) {
    button.disabled = true;
    button.textContent = texts.sending;
  }
  try {
    await deliver(form, texts);
  } catch {
    setStatus(form, 'error', texts.genericError);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = label;
    }
  }
};

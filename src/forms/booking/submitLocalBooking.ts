import { formatText } from '@/domain/formatText';
import { clearFieldErrors } from '@/forms/fieldErrors';
import { focusFirstInvalidField, showBookingFieldError } from './bookingFieldErrors';
import { bookingFieldMessages } from './bookingFieldMessages';
import type { BookingFormController } from './BookingFormController';
import { saveLocalBooking } from './localBookingsStore';
import { renderLocalBookings } from './renderLocalBookings';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PHONE_DIGITS = 6;
const MIN_NAME_LENGTH = 2;

const setStatus = (form: HTMLFormElement, message: string): void => {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  if (status) {
    status.textContent = message;
  }
};

const valueOf = (data: FormData, name: string): string => String(data.get(name) ?? '').trim();

const findInvalidFields = (data: FormData, slotMode: boolean): string[] => {
  const invalid: string[] = [];
  if (!valueOf(data, 'sesion')) {
    invalid.push('sesion');
  }
  if (slotMode && !valueOf(data, 'slot')) {
    invalid.push('slot');
  }
  if (!slotMode && !valueOf(data, 'fecha')) {
    invalid.push('fecha');
  }
  if (valueOf(data, 'nombre').length < MIN_NAME_LENGTH) {
    invalid.push('nombre');
  }
  if (!EMAIL_PATTERN.test(valueOf(data, 'email'))) {
    invalid.push('email');
  }
  if (valueOf(data, 'telefono').replace(/\D/g, '').length < MIN_PHONE_DIGITS) {
    invalid.push('telefono');
  }
  if (!valueOf(data, 'acepto')) {
    invalid.push('acepto');
  }
  return invalid;
};

const describeWhen = (controller: BookingFormController, data: FormData, slotMode: boolean): string => {
  const { form, localeTag } = controller;
  if (slotMode) {
    const timeZone = form.dataset['timeZone'] ?? 'UTC';
    return new Intl.DateTimeFormat(localeTag, { dateStyle: 'full', timeStyle: 'short', timeZone }).format(new Date(valueOf(data, 'slot')));
  }
  const day = new Intl.DateTimeFormat(localeTag, { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${valueOf(data, 'fecha')}T12:00:00Z`));
  const frame = form.querySelector<HTMLInputElement>('input[name="franja"]:checked')?.closest('label')?.textContent?.trim();
  return frame ? `${day} · ${frame}` : day;
};

export const submitLocalBooking = (controller: BookingFormController): void => {
  const { form, texts } = controller;
  clearFieldErrors(form);
  setStatus(form, '');
  const data = new FormData(form);
  const slotMode = form.dataset['scheduleMode'] === 'slots';
  const invalid = findInvalidFields(data, slotMode);
  if (invalid.length > 0) {
    const messages = bookingFieldMessages(texts);
    invalid.forEach((name) => showBookingFieldError(form, name, messages[name] ?? texts.errorGeneric));
    setStatus(form, texts.fieldErrors);
    focusFirstInvalidField(form);
    return;
  }
  const title = form.querySelector<HTMLInputElement>('input[name="sesion"]:checked')?.closest('label')?.querySelector('.card-title')?.textContent?.trim() ?? '';
  const when = describeWhen(controller, data, slotMode);
  try {
    saveLocalBooking({
      id: crypto.randomUUID(),
      title,
      when,
      slot: slotMode ? valueOf(data, 'slot') : null,
      name: valueOf(data, 'nombre'),
      email: valueOf(data, 'email'),
    });
  } catch {
    setStatus(form, texts.errorGeneric);
    return;
  }
  form.reset();
  controller.refresh();
  renderLocalBookings(form, texts);
  setStatus(form, formatText(texts.localSaved, { name: valueOf(data, 'nombre'), session: title, when }));
};

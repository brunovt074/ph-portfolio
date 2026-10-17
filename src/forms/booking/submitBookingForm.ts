import { actions, isInputError } from 'astro:actions';
import type { BookingActionResult } from '@/actions/BookingActionResult';
import type { BookingProblem } from '@/actions/BookingProblem';
import { clearFieldErrors } from '@/forms/fieldErrors';
import { bookingFieldMessages } from './bookingFieldMessages';
import { focusFirstInvalidField, showBookingFieldError } from './bookingFieldErrors';
import type { BookingFormController } from './BookingFormController';
import { applyScheduleMode } from './scheduleMode';
import { updateAmounts } from './updateAmounts';

const setStatus = (form: HTMLFormElement, message: string): void => {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  if (status) {
    status.textContent = message;
  }
};

const showInputErrors = (controller: BookingFormController, fields: Record<string, string[] | undefined>): void => {
  const messages = bookingFieldMessages(controller.texts);
  Object.keys(fields).forEach((name) => showBookingFieldError(controller.form, name, messages[name] ?? controller.texts.errorGeneric));
  setStatus(controller.form, controller.texts.fieldErrors);
  focusFirstInvalidField(controller.form);
};

const reject = (controller: BookingFormController, problem: BookingProblem): void => {
  const { form, texts, picker } = controller;
  const handlers: Record<BookingProblem, () => void> = {
    offer: () => {
      showBookingFieldError(form, 'sesion', texts.problemOffer);
      focusFirstInvalidField(form);
    },
    date: () => {
      showBookingFieldError(form, 'fecha', texts.errorDate);
      focusFirstInvalidField(form);
    },
    slot_required: () => {
      showBookingFieldError(form, 'slot', texts.errorSlot);
      focusFirstInvalidField(form);
    },
    slot_taken: () => {
      picker?.reload();
      showBookingFieldError(form, 'slot', texts.problemSlotTaken);
      setStatus(form, texts.problemSlotTaken);
    },
    calendar: () => {
      applyScheduleMode(form, 'request');
      setStatus(form, texts.problemCalendar);
    },
    gateway: () => setStatus(form, texts.problemGateway),
  };
  handlers[problem]();
};

const messageFor = (controller: BookingFormController, code: string): string =>
  code === 'TOO_MANY_REQUESTS' ? controller.texts.problemRateLimited : controller.texts.errorGeneric;

const deliver = async (controller: BookingFormController): Promise<boolean> => {
  const { data, error } = await actions.booking(new FormData(controller.form));
  if (error) {
    if (isInputError(error)) {
      showInputErrors(controller, error.fields);
    } else {
      setStatus(controller.form, messageFor(controller, error.code));
    }
    return false;
  }
  const result = data as BookingActionResult;
  if (result.status === 'rejected') {
    reject(controller, result.problem);
    return false;
  }
  window.location.assign(result.checkoutUrl);
  return true;
};

export const submitBookingForm = async (controller: BookingFormController): Promise<void> => {
  const { form, texts, localeTag } = controller;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  clearFieldErrors(form);
  setStatus(form, '');
  if (button) {
    button.disabled = true;
    button.textContent = texts.submitting;
  }
  let redirecting = false;
  try {
    redirecting = await deliver(controller);
  } catch {
    setStatus(form, texts.errorGeneric);
  }
  if (!redirecting && button) {
    button.disabled = false;
    updateAmounts(form, texts, localeTag);
  }
};

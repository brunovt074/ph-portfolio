import { BookingFormController } from './BookingFormController';
import { preselectBookingForm } from './preselectBookingForm';
import { setDateBounds } from './setDateBounds';
import { submitBookingForm } from './submitBookingForm';

const startForm = (form: HTMLFormElement): void => {
  if (form.dataset['ready'] === 'true') {
    return;
  }
  form.dataset['ready'] = 'true';
  form.noValidate = true;
  const controller = new BookingFormController(form);
  setDateBounds(form, form.dataset['timeZone'] ?? 'UTC');
  preselectBookingForm(form);
  controller.refresh();
  form.addEventListener('change', (event) => {
    const name = (event.target as HTMLInputElement).name;
    if (name === 'sesion' || name === 'plan') {
      controller.refresh();
    }
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void submitBookingForm(controller);
  });
};

export const initBookingForms = (): void => {
  document.querySelectorAll<HTMLFormElement>('[data-booking-form]').forEach(startForm);
};

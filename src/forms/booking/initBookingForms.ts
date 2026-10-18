import { clearBookingFieldError } from './bookingFieldErrors';
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
  const onEdit = (event: Event): void => {
    const name = (event.target as HTMLInputElement).name;
    clearBookingFieldError(form, name);
    if (event.type === 'change' && (name === 'sesion' || name === 'plan')) {
      controller.refresh();
    }
  };
  form.addEventListener('change', onEdit);
  form.addEventListener('input', onEdit);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void submitBookingForm(controller);
  });
};

export const initBookingForms = (): void => {
  document.querySelectorAll<HTMLFormElement>('[data-booking-form]').forEach(startForm);
};

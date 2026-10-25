import { clearBookingFieldError } from './bookingFieldErrors';
import { BookingFormController } from './BookingFormController';
import { removeLocalBooking } from './localBookingsStore';
import { preselectBookingForm } from './preselectBookingForm';
import { renderLocalBookings } from './renderLocalBookings';
import { setDateBounds } from './setDateBounds';
import { submitBookingForm } from './submitBookingForm';
import { submitLocalBooking } from './submitLocalBooking';

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
    if (controller.localReservations) {
      submitLocalBooking(controller);
      return;
    }
    void submitBookingForm(controller);
  });
  if (controller.localReservations) {
    renderLocalBookings(form, controller.texts);
    form.addEventListener('click', (event) => {
      const id = (event.target as HTMLElement).closest<HTMLElement>('[data-cancel-booking]')?.dataset['cancelBooking'];
      if (!id) {
        return;
      }
      removeLocalBooking(id);
      renderLocalBookings(form, controller.texts);
      controller.picker?.reload();
    });
  }
};

export const initBookingForms = (): void => {
  document.querySelectorAll<HTMLFormElement>('[data-booking-form]').forEach(startForm);
};

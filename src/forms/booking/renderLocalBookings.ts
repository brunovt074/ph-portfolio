import type { BookingTexts } from './BookingTexts';
import { readLocalBookings } from './localBookingsStore';

export const renderLocalBookings = (form: HTMLFormElement, texts: BookingTexts): void => {
  const section = form.querySelector<HTMLElement>('[data-local-bookings]');
  const list = form.querySelector<HTMLElement>('[data-local-list]');
  if (!section || !list) {
    return;
  }
  const bookings = readLocalBookings();
  section.hidden = bookings.length === 0;
  list.replaceChildren(
    ...bookings.map((booking) => {
      const item = document.createElement('li');
      item.className = 'local-item';
      const title = document.createElement('strong');
      title.textContent = booking.title;
      const when = document.createElement('span');
      when.textContent = booking.when;
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'local-cancel';
      cancel.dataset['cancelBooking'] = booking.id;
      cancel.textContent = texts.localCancel;
      item.append(title, when, cancel);
      return item;
    }),
  );
};

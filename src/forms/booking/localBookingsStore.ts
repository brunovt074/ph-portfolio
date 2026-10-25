import type { LocalBooking } from './LocalBooking';

const STORAGE_KEY = 'ph-portfolio:reservas';

const isText = (value: unknown): value is string => typeof value === 'string';

const isLocalBooking = (value: unknown): value is LocalBooking => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    isText(candidate['id']) &&
    isText(candidate['title']) &&
    isText(candidate['when']) &&
    (isText(candidate['slot']) || candidate['slot'] === null) &&
    isText(candidate['name']) &&
    isText(candidate['email'])
  );
};

export const readLocalBookings = (): LocalBooking[] => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isLocalBooking) : [];
  } catch {
    return [];
  }
};

const writeLocalBookings = (bookings: LocalBooking[]): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
};

export const saveLocalBooking = (booking: LocalBooking): void => {
  writeLocalBookings([...readLocalBookings(), booking]);
};

export const removeLocalBooking = (id: string): void => {
  writeLocalBookings(readLocalBookings().filter((booking) => booking.id !== id));
};

export const isSlotTakenLocally = (slot: string): boolean => readLocalBookings().some((booking) => booking.slot === slot);

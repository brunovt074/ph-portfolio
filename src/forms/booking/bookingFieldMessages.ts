import type { BookingTexts } from './BookingTexts';

export const bookingFieldMessages = (texts: BookingTexts): Record<string, string> => ({
  sesion: texts.errorSession,
  fecha: texts.errorDate,
  slot: texts.errorSlot,
  franja: texts.errorFrame,
  plan: texts.errorPlan,
  nombre: texts.errorName,
  email: texts.errorEmail,
  telefono: texts.errorPhone,
  notas: texts.errorNotes,
  acepto: texts.errorAccept,
});

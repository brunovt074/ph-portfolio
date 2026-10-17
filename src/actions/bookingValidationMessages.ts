import { esTexts } from '@/infrastructure/texts/defaults/esTexts';

const texts = esTexts.booking;

export const bookingValidationMessages = {
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
} as const;

export type BookingFieldName = keyof typeof bookingValidationMessages;

export const bookingFieldNames = Object.keys(bookingValidationMessages) as BookingFieldName[];

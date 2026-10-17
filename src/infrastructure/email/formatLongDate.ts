export const formatLongDate = (instant: Date, timeZone: string): string =>
  new Intl.DateTimeFormat('es-AR', { dateStyle: 'full', timeZone }).format(instant);

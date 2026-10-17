export const formatClock = (instant: Date, timeZone: string): string =>
  new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone }).format(instant);

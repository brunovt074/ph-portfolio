export const formatInstantTime = (instant: Date, localeTag: string, timeZone: string): string =>
  new Intl.DateTimeFormat(localeTag, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone }).format(instant);

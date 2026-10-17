export const formatInstantDay = (instant: Date, localeTag: string, timeZone: string): string =>
  new Intl.DateTimeFormat(localeTag, { weekday: 'long', day: 'numeric', month: 'long', timeZone }).format(instant);

export const formatDay = (isoDay: string, localeTag: string): string =>
  new Intl.DateTimeFormat(localeTag, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${isoDay}T12:00:00Z`));

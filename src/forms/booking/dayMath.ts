const DAY_IN_MILLISECONDS = 86_400_000;

export const todayIn = (timeZone: string): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export const addDays = (isoDay: string, days: number): string =>
  new Date(Date.parse(`${isoDay}T00:00:00Z`) + days * DAY_IN_MILLISECONDS).toISOString().slice(0, 10);

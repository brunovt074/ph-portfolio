export const toIsoDay = (milliseconds: number): string => new Date(milliseconds).toISOString().slice(0, 10);

export const isRealDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && toIsoDay(Date.parse(`${value}T00:00:00Z`)) === value;

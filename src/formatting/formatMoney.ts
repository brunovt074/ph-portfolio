export const formatMoney = (cents: number, localeTag: string): string =>
  new Intl.NumberFormat(localeTag, { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(cents / 100);

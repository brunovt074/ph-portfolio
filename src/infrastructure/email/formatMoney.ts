const moneyFormat = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

export const formatMoney = (cents: number): string => moneyFormat.format(cents / 100).replace(/\u00a0/g, ' ');

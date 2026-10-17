export const calculateDeposit = (totalCents: number, depositPercent: number): number =>
  Math.round((totalCents * depositPercent) / 100 / 100) * 100;

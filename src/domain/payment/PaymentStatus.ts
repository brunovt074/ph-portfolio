export const paymentStatuses = ['pending', 'approved', 'rejected', 'cancelled', 'refunded'] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];

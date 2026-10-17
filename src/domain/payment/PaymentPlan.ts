export const paymentPlans = ['deposit', 'full'] as const;
export type PaymentPlan = (typeof paymentPlans)[number];

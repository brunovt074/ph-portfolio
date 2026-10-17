export const paymentKinds = ['deposit', 'full', 'balance'] as const;
export type PaymentKind = (typeof paymentKinds)[number];

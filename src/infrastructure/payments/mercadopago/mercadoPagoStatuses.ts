import type { PaymentStatus } from '@/domain/payment/PaymentStatus';

export const mercadoPagoStatuses: Record<string, PaymentStatus> = {
  approved: 'approved',
  pending: 'pending',
  in_process: 'pending',
  authorized: 'pending',
  in_mediation: 'pending',
  rejected: 'rejected',
  cancelled: 'cancelled',
  refunded: 'refunded',
  charged_back: 'refunded',
};

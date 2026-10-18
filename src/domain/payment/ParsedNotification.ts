export type ParsedNotification = { kind: 'payment'; externalPaymentId: string } | { kind: 'ignored' } | { kind: 'invalid' };

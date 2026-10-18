export class PaymentConfigurationError extends Error {
  constructor(problem: string) {
    super(`Invalid payments configuration: ${problem}`);
    this.name = 'PaymentConfigurationError';
  }
}

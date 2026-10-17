import { afterEach, describe, expect, it, vi } from 'vitest';
import { MessageDeliveryError } from '@/domain/MessageDeliveryError';
import { ConsoleErrorReporter } from '@/infrastructure/reporting/ConsoleErrorReporter';

describe('ConsoleErrorReporter', () => {
  afterEach(() => vi.restoreAllMocks());

  it('writes the delivery failure reason to the server log without visitor data', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    new ConsoleErrorReporter().report(new MessageDeliveryError('provider down'));

    expect(spy).toHaveBeenCalledWith('[contact] delivery failed', 'Contact message could not be delivered: provider down');
  });
});

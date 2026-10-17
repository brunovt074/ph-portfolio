import { describe, expect, it } from 'vitest';
import { SendContactMessage } from '@/application/SendContactMessage';
import { MessageDeliveryError } from '@/domain/MessageDeliveryError';
import { aContactSubmission } from '../fixtures/aContactSubmission';
import { FailingMessageSender } from '../fakes/FailingMessageSender';
import { FakeErrorReporter } from '../fakes/FakeErrorReporter';
import { UnexpectedFailureMessageSender } from '../fakes/UnexpectedFailureMessageSender';
import { FakeMessageSender } from '../fakes/FakeMessageSender';

describe('SendContactMessage', () => {
  it('delivers the inquiry of a brand owner without the honeypot field', async () => {
    const sender = new FakeMessageSender();

    await new SendContactMessage(sender, new FakeErrorReporter()).execute(aContactSubmission());

    expect(sender.sent).toEqual([
      {
        name: 'Sofía Paredes',
        email: 'sofia@marca.com',
        type: 'Marca / producto',
        message: 'Necesito fotos de producto para el lanzamiento de mi tienda online.',
        copy: '',
      },
    ]);
  });

  it('forwards which print a collector asked about', async () => {
    const sender = new FakeMessageSender();

    await new SendContactMessage(sender, new FakeErrorReporter()).execute(aContactSubmission({ type: 'Copia de autor', copy: 'Sin título 03' }));

    expect(sender.sent[0]?.copy).toBe('Sin título 03');
  });

  it('silently drops a submission filled in by a bot', async () => {
    const sender = new FakeMessageSender();

    await expect(new SendContactMessage(sender, new FakeErrorReporter()).execute(aContactSubmission({ website: 'http://spam.example' }))).resolves.toBeUndefined();

    expect(sender.sent).toEqual([]);
  });

  it('lets the visitor know when the email provider is down', async () => {
    await expect(new SendContactMessage(new FailingMessageSender(), new FakeErrorReporter()).execute(aContactSubmission())).rejects.toBeInstanceOf(MessageDeliveryError);
  });

  it('reports a failed delivery so Sarah can notice the provider is down', async () => {
    const reporter = new FakeErrorReporter();

    await expect(new SendContactMessage(new FailingMessageSender(), reporter).execute(aContactSubmission())).rejects.toBeInstanceOf(MessageDeliveryError);

    expect(reporter.reported).toHaveLength(1);
    expect(reporter.reported[0]?.message).toBe('Contact message could not be delivered: provider down');
  });

  it('does not report failures that are not delivery problems', async () => {
    const reporter = new FakeErrorReporter();

    await expect(new SendContactMessage(new UnexpectedFailureMessageSender(), reporter).execute(aContactSubmission())).rejects.toBeInstanceOf(TypeError);

    expect(reporter.reported).toEqual([]);
  });
});

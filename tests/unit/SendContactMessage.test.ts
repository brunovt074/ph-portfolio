import { describe, expect, it } from 'vitest';
import { SendContactMessage } from '@/application/SendContactMessage';
import { MessageDeliveryError } from '@/domain/MessageDeliveryError';
import { aContactSubmission } from '../fixtures/aContactSubmission';
import { FailingMessageSender } from '../fakes/FailingMessageSender';
import { FakeMessageSender } from '../fakes/FakeMessageSender';

describe('SendContactMessage', () => {
  it('delivers the inquiry of a brand owner without the honeypot field', async () => {
    const sender = new FakeMessageSender();

    await new SendContactMessage(sender).execute(aContactSubmission());

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

    await new SendContactMessage(sender).execute(aContactSubmission({ type: 'Copia de autor', copy: 'Sin título 03' }));

    expect(sender.sent[0]?.copy).toBe('Sin título 03');
  });

  it('silently drops a submission filled in by a bot', async () => {
    const sender = new FakeMessageSender();

    await expect(new SendContactMessage(sender).execute(aContactSubmission({ website: 'http://spam.example' }))).resolves.toBeUndefined();

    expect(sender.sent).toEqual([]);
  });

  it('lets the visitor know when the email provider is down', async () => {
    await expect(new SendContactMessage(new FailingMessageSender()).execute(aContactSubmission())).rejects.toBeInstanceOf(MessageDeliveryError);
  });
});

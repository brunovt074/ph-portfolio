import { describe, expect, it } from 'vitest';
import { MessageDeliveryError } from '@/domain/MessageDeliveryError';
import { ResendMessageSender } from '@/infrastructure/email/ResendMessageSender';
import type { ResendEmailClient, ResendEmailPayload } from '@/infrastructure/email/ResendEmailClient';

const message = { name: 'Sofía Paredes', email: 'sofia@marca.com', type: 'Evento', message: 'Necesito cobertura para una comparsa.', copy: '', locale: 'es' as const };

const clientReturning = (error: { message: string } | null) => {
  const payloads: ResendEmailPayload[] = [];
  const client: ResendEmailClient = {
    emails: {
      async send(payload) {
        payloads.push(payload);
        return { error };
      },
    },
  };
  return { client, payloads };
};

describe('ResendMessageSender', () => {
  it('sends the inquiry to the photographer and lets her reply straight to the visitor', async () => {
    const { client, payloads } = clientReturning(null);

    await new ResendMessageSender(client, 'photographer@example.com', 'Sitio <sitio@example.com>').send(message);

    expect(payloads).toEqual([
      {
        from: 'Sitio <sitio@example.com>',
        to: 'photographer@example.com',
        replyTo: 'sofia@marca.com',
        subject: 'Nueva consulta: Evento — Sofía Paredes',
        text: 'Nombre: Sofía Paredes\nEmail: sofia@marca.com\nTipo de trabajo: Evento\nIdioma: Español\n\nNecesito cobertura para una comparsa.',
      },
    ]);
  });

  it('reports a provider rejection as a delivery error', async () => {
    const { client } = clientReturning({ message: 'domain not verified' });

    await expect(new ResendMessageSender(client, 'photographer@example.com', 'sitio@example.com').send(message)).rejects.toBeInstanceOf(MessageDeliveryError);
  });
});

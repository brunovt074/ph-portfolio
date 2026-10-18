import { describe, expect, it } from 'vitest';
import { ConsoleMessageSender } from '@/infrastructure/email/ConsoleMessageSender';
import { createMessageSender } from '@/infrastructure/email/createMessageSender';
import { ResendMessageSender } from '@/infrastructure/email/ResendMessageSender';
import { UnavailableMessageSender } from '@/infrastructure/email/UnavailableMessageSender';
import { MessageDeliveryError } from '@/domain/MessageDeliveryError';

const configured = { apiKey: 're_test', toEmail: 'lara@example.com', fromEmail: 'sitio@example.com', consoleDelivery: false };
const message = { name: 'Sofía', email: 'sofia@marca.com', type: '', message: 'Hola, quiero una sesión.', copy: '', locale: 'es' as const };

describe('createMessageSender', () => {
  it('uses Resend when the account is configured', () => {
    expect(createMessageSender(configured)).toBeInstanceOf(ResendMessageSender);
  });

  it('prefers Resend over the console when both are available', () => {
    expect(createMessageSender({ ...configured, consoleDelivery: true })).toBeInstanceOf(ResendMessageSender);
  });

  it('logs to the console during local development without keys', () => {
    expect(createMessageSender({ apiKey: undefined, toEmail: undefined, fromEmail: undefined, consoleDelivery: true })).toBeInstanceOf(ConsoleMessageSender);
  });

  it('refuses to pretend delivery in production without keys', async () => {
    const sender = createMessageSender({ ...configured, apiKey: undefined });

    expect(sender).toBeInstanceOf(UnavailableMessageSender);
    await expect(sender.send(message)).rejects.toBeInstanceOf(MessageDeliveryError);
  });

  it('logs the formatted email in the console sender', async () => {
    const lines: string[] = [];

    await new ConsoleMessageSender((line) => lines.push(line)).send(message);

    expect(lines[0]).toContain('Nueva consulta: Consulta general — Sofía');
  });

  it('uses console.info when no logger is given', async () => {
    const originalInfo = console.info;
    const calls: string[] = [];
    console.info = (line: string) => calls.push(line);
    try {
      await new ConsoleMessageSender().send(message);
    } finally {
      console.info = originalInfo;
    }

    expect(calls).toHaveLength(1);
  });
});

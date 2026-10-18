import { describe, expect, it } from 'vitest';
import { formatContactEmail } from '@/infrastructure/email/formatContactEmail';

const base = { name: 'Sofía Paredes', email: 'sofia@marca.com', type: 'Marca / producto', message: 'Hola Sarah, quiero un presupuesto.', copy: '', locale: 'es' as const };

describe('formatContactEmail', () => {
  it('builds the subject Sarah sees in her inbox', () => {
    expect(formatContactEmail(base).subject).toBe('Nueva consulta: Marca / producto — Sofía Paredes');
  });

  it('writes every field in a plain text body', () => {
    expect(formatContactEmail(base).text).toBe(
      'Nombre: Sofía Paredes\nEmail: sofia@marca.com\nTipo de trabajo: Marca / producto\nIdioma: Español\n\nHola Sarah, quiero un presupuesto.',
    );
  });

  it('names the visitor language in the email', () => {
    expect(formatContactEmail({ ...base, locale: 'pt' }).text).toContain('Idioma: Portugués');
    expect(formatContactEmail({ ...base, locale: 'en' }).text).toContain('Idioma: Inglés');
  });

  it('labels an inquiry without a work type as general', () => {
    expect(formatContactEmail({ ...base, type: '' }).subject).toBe('Nueva consulta: Consulta general — Sofía Paredes');
  });

  it('keeps the subject on one line when the visitor tries to inject a header', () => {
    const subject = formatContactEmail({ ...base, type: 'A\r\nBcc: x@y.com', name: 'Sofía\nParedes' }).subject;

    expect(subject).toBe('Nueva consulta: A Bcc: x@y.com — Sofía Paredes');
  });

  it('tells Sarah in which language the visitor wrote', () => {
    expect(formatContactEmail({ ...base, locale: 'pt' }).text).toContain('Idioma: Portugués');
  });

  it('mentions the print a collector asked about', () => {
    expect(formatContactEmail({ ...base, type: 'Copia de autor', copy: 'Sin título 03' }).text).toContain('Copia consultada: Sin título 03');
  });
});

import { describe, expect, it } from 'vitest';
import { formatContactEmail } from '@/infrastructure/email/formatContactEmail';

const base = { name: 'Sofía Paredes', email: 'sofia@marca.com', type: 'Marca / producto', message: 'Hola Lara, quiero un presupuesto.', copy: '' };

describe('formatContactEmail', () => {
  it('builds the subject Lara sees in her inbox', () => {
    expect(formatContactEmail(base).subject).toBe('Nueva consulta: Marca / producto — Sofía Paredes');
  });

  it('writes every field in a plain text body', () => {
    expect(formatContactEmail(base).text).toBe(
      'Nombre: Sofía Paredes\nEmail: sofia@marca.com\nTipo de trabajo: Marca / producto\n\nHola Lara, quiero un presupuesto.',
    );
  });

  it('labels an inquiry without a work type as general', () => {
    expect(formatContactEmail({ ...base, type: '' }).subject).toBe('Nueva consulta: Consulta general — Sofía Paredes');
  });

  it('mentions the print a collector asked about', () => {
    expect(formatContactEmail({ ...base, type: 'Copia de autor', copy: 'Sin título 03' }).text).toContain('Copia consultada: Sin título 03');
  });
});

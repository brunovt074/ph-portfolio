import { defineField, type Rule } from 'sanity';

interface LocalizedValue {
  es?: unknown;
}

const hasText = (value: unknown): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some((item) => hasText(item));
  if (typeof value === 'object' && value !== null) {
    const { children } = value as { children?: unknown };
    return hasText(children) || hasText((value as { text?: unknown }).text);
  }
  return false;
};

export const requiredSpanish = (rule: Rule) =>
  rule.custom((value) => (hasText((value as LocalizedValue | undefined)?.es) ? true : 'Completá el texto en español.'));

const altLengthProblem = (value: unknown): string | true =>
  typeof value === 'string' && value.trim().length > 0 && (value.trim().length < 10 || value.trim().length > 160)
    ? 'Cada descripción tiene que tener entre 10 y 160 letras.'
    : true;

export const requiredSpanishAlt = (rule: Rule) =>
  rule.custom((value) => {
    const alt = value as Record<'es' | 'en' | 'pt', unknown> | undefined;
    if (!hasText(alt?.es)) return 'Completá el texto en español.';
    return [alt?.es, alt?.en, alt?.pt].map(altLengthProblem).find((problem) => problem !== true) ?? true;
  });

export const campoTexto = (name: string, title: string, description?: string) =>
  defineField({ name, title, ...(description && { description }), type: 'textoLocalizado', validation: (rule) => requiredSpanish(rule) });

export const campoParrafo = (name: string, title: string, description?: string) =>
  defineField({ name, title, ...(description && { description }), type: 'parrafoLocalizado', validation: (rule) => requiredSpanish(rule) });

export const campoTitulo = (name: string, title: string) =>
  defineField({
    name,
    title,
    description: 'Seleccioná una palabra y tocá "Itálica" para destacarla.',
    type: 'tituloLocalizado',
    validation: (rule) => requiredSpanish(rule),
  });

export const campoLista = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    ...(description && { description }),
    type: 'listaLocalizada',
    validation: (rule) => requiredSpanish(rule),
  });

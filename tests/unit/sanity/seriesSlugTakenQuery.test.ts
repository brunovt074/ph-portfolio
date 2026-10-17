import { evaluate, parse } from 'groq-js';
import { describe, expect, it } from 'vitest';
import type { Locale } from '../../../src/domain/Locale';
import { seriesSlugTakenQuery } from '../../../sanity/validation/seriesSlugTakenQuery';

const serie = (id: string, slugs: Partial<Record<Locale, string>>) => ({
  _id: id,
  _type: 'serie',
  slug: Object.fromEntries(Object.entries(slugs).map(([locale, current]) => [locale, { _type: 'slug', current }])),
});

const count = async (dataset: unknown[], locale: Locale, slug: string, id: string) => {
  const result = await evaluate(parse(seriesSlugTakenQuery(locale)), { dataset, params: { slug, id } });
  return result.get();
};

describe('seriesSlugTakenQuery', () => {
  it('counts another published series that already uses the address in that language', async () => {
    const dataset = [serie('serie-a', { es: 'tiempo' }), serie('serie-b', { es: 'otra' })];
    expect(await count(dataset, 'es', 'tiempo', 'serie-b')).toBe(1);
  });

  it('ignores the draft and published twins of the series being edited', async () => {
    const dataset = [serie('serie-a', { en: 'time' }), serie('drafts.serie-a', { en: 'time' })];
    expect(await count(dataset, 'en', 'time', 'serie-a')).toBe(0);
  });

  it('ignores a series that uses the same address in a different language', async () => {
    const dataset = [serie('serie-a', { es: 'tiempo' })];
    expect(await count(dataset, 'pt', 'tiempo', 'serie-b')).toBe(0);
  });
});

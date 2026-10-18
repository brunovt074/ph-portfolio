import { describe, expect, it } from 'vitest';
import { alternatePaths } from '@/domain/routing/alternatePaths';

describe('alternatePaths', () => {
  it('maps a section to its path in every language', () => {
    expect(alternatePaths(() => ({ route: 'marcas' }))).toEqual({ es: '/es/marcas', en: '/en/brands', pt: '/pt/marcas' });
  });

  it('maps a series using its translated slug per language', () => {
    expect(alternatePaths((locale) => ({ route: 'serie', slug: { es: 'oficios', en: 'trades', pt: 'oficios' }[locale] }))).toEqual({
      es: '/es/obra/oficios',
      en: '/en/work/trades',
      pt: '/pt/obra/oficios',
    });
  });
});

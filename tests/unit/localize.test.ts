import { describe, expect, it } from 'vitest';
import { localize, localizeList, localizeText } from '@/infrastructure/sanity/mapping/localize';
import { translationsOf } from '@/infrastructure/sanity/mapping/translationsOf';
import { aSanityTitle } from '../fixtures/sanity/aSanityTitle';

describe('localize', () => {
  it('serves the text in the requested language', () => {
    expect(localize({ es: 'Retratos', en: 'Portraits' }, 'en')).toBe('Portraits');
  });

  it('falls back to Spanish when the translation is empty', () => {
    expect(localize({ es: 'Retratos', en: '' }, 'en')).toBe('Retratos');
  });

  it('falls back to Spanish when the translation is only spaces', () => {
    expect(localize({ es: 'Retratos', pt: '  ' }, 'pt')).toBe('Retratos');
  });

  it('falls back to Spanish when the translated list is empty', () => {
    expect(localize({ es: ['a'], en: [] }, 'en')).toEqual(['a']);
  });

  it('reads a value saved before the migration as Spanish for every language', () => {
    expect(localize('Retratos', 'en')).toBe('Retratos');
  });

  it('returns nothing for a field the photographer never filled', () => {
    expect(localize(null, 'en')).toBeUndefined();
  });

  it('returns nothing when not even the Spanish text exists', () => {
    expect(localize({ en: null }, 'pt')).toBeUndefined();
  });

  it('falls back to Spanish when a translated title has only empty segments', () => {
    const spanish = aSanityTitle(['Personas, '], ['sin pose', true]);

    expect(localize({ es: spanish, en: aSanityTitle(['  ']) }, 'en')).toBe(spanish);
  });

  it('keeps a slug saved before the migration', () => {
    expect(localize({ current: 'oficios' }, 'en')).toEqual({ current: 'oficios' });
  });
});

describe('localizeText', () => {
  it('turns a missing text into an empty one', () => {
    expect(localizeText(undefined, 'en')).toBe('');
  });

  it('serves the translated text', () => {
    expect(localizeText({ es: 'Hola', pt: 'Olá' }, 'pt')).toBe('Olá');
  });
});

describe('localizeList', () => {
  it('turns a missing list into an empty one', () => {
    expect(localizeList(null, 'es')).toEqual([]);
  });

  it('serves the translated list', () => {
    expect(localizeList({ es: ['Editorial'], en: ['Fashion'] }, 'en')).toEqual(['Fashion']);
  });
});

describe('translationsOf', () => {
  it('does not count a blank translation', () => {
    expect(translationsOf({ es: 'Hola', en: '  ' })).toEqual({ es: true, en: false, pt: false });
  });

  it('counts a language only when every main field has it', () => {
    expect(translationsOf({ es: 'Hola', en: 'Hello', pt: 'Olá' }, { es: 'Texto', pt: 'Texto' })).toEqual({ es: true, en: false, pt: true });
  });

  it('treats a value saved before the migration as Spanish only', () => {
    expect(translationsOf('Hola')).toEqual({ es: true, en: false, pt: false });
  });

  it('counts a translated rich title', () => {
    expect(translationsOf({ es: aSanityTitle(['Obra']), en: aSanityTitle(['Work', true]) })).toEqual({ es: true, en: true, pt: false });
  });
});

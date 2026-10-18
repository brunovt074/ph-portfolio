import { describe, expect, it } from 'vitest';
import { defaultLocale, isLocale, locales, parseLocale } from '@/domain/Locale';
import { localeFromPath } from '@/domain/routing/localeFromPath';

describe('localeFromPath', () => {
  it('detects the language from the first path segment', () => {
    expect(localeFromPath('/es/editorial')).toBe('es');
    expect(localeFromPath('/es/')).toBe('es');
  });

  it('falls back to Spanish for disabled languages', () => {
    expect(localeFromPath('/en/portraits')).toBe('es');
    expect(localeFromPath('/pt/')).toBe('es');
  });

  it('falls back to Spanish for unprefixed paths', () => {
    expect(localeFromPath('/entrevistas')).toBe('es');
    expect(localeFromPath('/')).toBe('es');
  });
});

describe('Locale', () => {
  it('exposes supported languages with Spanish as default', () => {
    expect(locales).toEqual(['es', 'en', 'pt']);
    expect(defaultLocale).toBe('es');
  });

  it('recognises supported languages only', () => {
    expect(isLocale('es')).toBe(true);
    expect(isLocale('en')).toBe(false);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it('parses a stored preference and falls back to Spanish', () => {
    expect(parseLocale('es')).toBe('es');
    expect(parseLocale('pt')).toBe('es');
    expect(parseLocale('fr')).toBe('es');
    expect(parseLocale(null)).toBe('es');
    expect(parseLocale(undefined)).toBe('es');
  });
});

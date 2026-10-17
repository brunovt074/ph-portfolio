import { describe, expect, it } from 'vitest';
import { defaultLocale, isLocale, locales, parseLocale } from '@/domain/Locale';
import { localeFromPath } from '@/domain/routing/localeFromPath';

describe('localeFromPath', () => {
  it('detects the language from the first path segment', () => {
    expect(localeFromPath('/en/portraits')).toBe('en');
    expect(localeFromPath('/pt/')).toBe('pt');
    expect(localeFromPath('/pt')).toBe('pt');
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
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it('parses a stored preference and falls back to Spanish', () => {
    expect(parseLocale('pt')).toBe('pt');
    expect(parseLocale('fr')).toBe('es');
    expect(parseLocale(null)).toBe('es');
    expect(parseLocale(undefined)).toBe('es');
  });
});

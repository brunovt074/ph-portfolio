import { describe, expect, it } from 'vitest';
import { localeFromReferer } from '@/domain/routing/localeFromReferer';

describe('localeFromReferer', () => {
  it('keeps an English visitor in English after being rate limited', () => {
    expect(localeFromReferer('https://sarahmoreau.example/en/work/prints')).toBe('en');
  });

  it('answers in Spanish when the form was sent from a Spanish page', () => {
    expect(localeFromReferer('https://sarahmoreau.example/es/marcas')).toBe('es');
  });

  it('answers in Spanish when the browser sends no referer', () => {
    expect(localeFromReferer(null)).toBe('es');
  });

  it('answers in Spanish when the referer is not a valid URL', () => {
    expect(localeFromReferer('not a url')).toBe('es');
  });
});

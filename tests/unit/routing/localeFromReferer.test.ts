import { describe, expect, it } from 'vitest';
import { localeFromReferer } from '@/domain/routing/localeFromReferer';

describe('localeFromReferer', () => {
  it('answers in Spanish when the form was sent from a disabled language page', () => {
    expect(localeFromReferer('https://laravischi.com/en/work/prints')).toBe('es');
  });

  it('answers in Spanish when the form was sent from a Spanish page', () => {
    expect(localeFromReferer('https://laravischi.com/es/marcas')).toBe('es');
  });

  it('answers in Spanish when the browser sends no referer', () => {
    expect(localeFromReferer(null)).toBe('es');
  });

  it('answers in Spanish when the referer is not a valid URL', () => {
    expect(localeFromReferer('not a url')).toBe('es');
  });
});

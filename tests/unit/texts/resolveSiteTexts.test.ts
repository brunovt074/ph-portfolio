import { describe, expect, it } from 'vitest';
import { defaultSiteTexts } from '@/infrastructure/texts/defaults/defaultSiteTexts';
import { resolveSiteTexts } from '@/infrastructure/texts/resolveSiteTexts';

describe('resolveSiteTexts', () => {
  it('uses Sarah override for the requested language', () => {
    const texts = resolveSiteTexts({ nav: { bookSession: { es: 'Agendá', en: 'Book now' } } }, 'en');
    expect(texts.nav.bookSession).toBe('Book now');
  });

  it('falls back to the default of the same language, not to the Spanish override', () => {
    const texts = resolveSiteTexts({ nav: { bookSession: { es: 'Agendá' } } }, 'en');
    expect(texts.nav.bookSession).toBe(defaultSiteTexts.en.nav.bookSession);
  });

  it('treats a blank override as missing', () => {
    expect(resolveSiteTexts({ nav: { bookSession: { pt: '   ' } } }, 'pt').nav.bookSession).toBe(defaultSiteTexts.pt.nav.bookSession);
  });

  it('returns defaults when the document does not exist yet', () => {
    expect(resolveSiteTexts(null, 'es')).toEqual(defaultSiteTexts.es);
  });

  it('tolerates null groups and keys coming from Sanity', () => {
    expect(resolveSiteTexts({ nav: null, contact: { submit: null } }, 'es')).toEqual(defaultSiteTexts.es);
  });

  it('trims the override', () => {
    expect(resolveSiteTexts({ contact: { submit: { es: ' Enviar ' } } }, 'es').contact.submit).toBe('Enviar');
  });
});

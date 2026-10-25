import { describe, expect, it } from 'vitest';
import { locales } from '@/domain/Locale';
import { GetSiteTexts } from '@/application/GetSiteTexts';
import { defaultSiteTexts } from '@/infrastructure/texts/defaults/defaultSiteTexts';
import { FakeContentRepository } from '../../fakes/FakeContentRepository';

const placeholdersOf = (template: string): string[] =>
  [...template.matchAll(/\{(\w+)\}/g)].map((match) => match[1] as string).sort();

describe('defaultSiteTexts', () => {
  it('keeps the same placeholders in every language', () => {
    for (const locale of locales) {
      expect(placeholdersOf(defaultSiteTexts[locale].pages.seriesEyebrow)).toEqual(['count', 'number', 'years']);
      expect(placeholdersOf(defaultSiteTexts[locale].contact.copyMessage)).toEqual(['copy']);
    }
  });

  it('keeps the placeholders of every text identical to the Spanish one in every language', () => {
    const leaves = (locale: (typeof locales)[number]) =>
      Object.entries(defaultSiteTexts[locale]).flatMap(([group, keys]) =>
        Object.entries(keys as Record<string, string>).map(([key, value]) => [`${group}.${key}`, placeholdersOf(value)] as const),
      );
    for (const locale of locales) {
      expect(leaves(locale)).toEqual(leaves('es'));
    }
  });

  it('ships no bracketed placeholder in any default text', () => {
    for (const locale of locales) {
      expect(JSON.stringify(defaultSiteTexts[locale])).not.toMatch(/\[[^\]]+\]/);
    }
  });

  it('has a non-empty default for every key in every language', () => {
    for (const locale of locales) {
      for (const [group, keys] of Object.entries(defaultSiteTexts[locale])) {
        for (const [key, value] of Object.entries(keys as Record<string, string>)) {
          expect(value.trim(), `${locale}.${group}.${key}`).not.toBe('');
        }
      }
    }
  });

  it('defines the same keys in every language', () => {
    const shape = (locale: (typeof locales)[number]) =>
      Object.entries(defaultSiteTexts[locale]).map(([group, keys]) => [group, Object.keys(keys).sort()]);
    for (const locale of locales) {
      expect(shape(locale)).toEqual(shape('es'));
    }
  });
});

describe('GetSiteTexts', () => {
  it('returns the texts of the requested language', async () => {
    const texts = await new GetSiteTexts(new FakeContentRepository()).execute('pt');
    expect(texts.nav.retratos).toBe(defaultSiteTexts.pt.nav.retratos);
  });
});

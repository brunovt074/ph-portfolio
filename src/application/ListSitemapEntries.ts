import type { ContentRepository } from '@/domain/ContentRepository';
import { locales, type Locale } from '@/domain/Locale';
import { pathTo } from '@/domain/routing/pathTo';
import type { RouteTarget } from '@/domain/routing/RouteTarget';
import type { Translations } from '@/domain/Translations';

export interface SitemapEntry {
  path: string;
  alternates: Partial<Record<Locale | 'x-default', string>>;
}

interface PageTarget {
  targetFor: (locale: Locale) => RouteTarget;
  translations: Translations;
}

export class ListSitemapEntries {
  constructor(private readonly repository: ContentRepository) {}

  async execute(): Promise<SitemapEntry[]> {
    const [home, facets, brands, obra, series, printsContent, bookingOffers] = await Promise.all([
      this.repository.getHome('es'),
      this.repository.getFacets('es'),
      this.repository.getBrands('es'),
      this.repository.getObra('es'),
      this.repository.getSeries('es'),
      this.repository.getPrintsContent('es'),
      this.repository.getBookingOffers('es'),
    ]);

    const bookingTranslations: Translations = {
      es: true,
      en: bookingOffers.length > 0 && bookingOffers.every((offer) => offer.translations.en),
      pt: bookingOffers.length > 0 && bookingOffers.every((offer) => offer.translations.pt),
    };

    const pages: PageTarget[] = [
      { targetFor: () => ({ route: 'home' }), translations: home.translations },
      ...facets
        .filter((facet) => facet.slug !== 'marcas')
        .map((facet) => ({ targetFor: () => ({ route: facet.slug }), translations: facet.translations })),
      { targetFor: () => ({ route: 'marcas' }), translations: brands.translations },
      { targetFor: () => ({ route: 'obra' }), translations: obra.translations },
      { targetFor: () => ({ route: 'copias' }), translations: printsContent.translations },
      ...series.map((item) => ({
        targetFor: (locale: Locale) => ({ route: 'serie' as const, slug: item.slugs[locale] }),
        translations: item.translations,
      })),
      { targetFor: () => ({ route: 'reservas' }), translations: bookingTranslations },
    ];

    const entries: SitemapEntry[] = [];
    for (const page of pages) {
      const translated = locales.filter((locale) => page.translations[locale]);
      const alternates: Partial<Record<Locale | 'x-default', string>> = Object.fromEntries(
        translated.map((locale) => [locale, pathTo(locale, page.targetFor(locale))]),
      );
      alternates['x-default'] = page.translations.en ? pathTo('en', page.targetFor('en')) : pathTo('es', page.targetFor('es'));
      for (const locale of translated) {
        entries.push({ path: pathTo(locale, page.targetFor(locale)), alternates });
      }
    }
    return entries;
  }
}

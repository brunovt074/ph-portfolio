import type { BookingOffer } from '@/domain/booking/BookingOffer';
import type { ContentRepository } from '@/domain/ContentRepository';
import { locales, type Locale } from '@/domain/Locale';
import { pathTo } from '@/domain/routing/pathTo';
import type { RouteTarget } from '@/domain/routing/RouteTarget';
import type { Translations } from '@/domain/Translations';
import type { SitemapEntry } from './results/SitemapEntry';

interface SitemapPage {
  targetFor: (locale: Locale) => RouteTarget;
  translations: Translations;
}

const entriesOf = ({ targetFor, translations }: SitemapPage): SitemapEntry[] => {
  const translated = locales.filter((locale) => translations[locale]);
  const pathOf = (locale: Locale) => pathTo(locale, targetFor(locale));
  const defaultLocale: Locale = translations.en ? 'en' : 'es';
  const alternates: SitemapEntry['alternates'] = {
    ...Object.fromEntries(translated.map((locale) => [locale, pathOf(locale)])),
    'x-default': pathOf(defaultLocale),
  };
  return translated.map((locale) => ({ path: pathOf(locale), alternates: { ...alternates } }));
};

const bookingTranslations = (offers: BookingOffer[]): Translations =>
  Object.fromEntries(
    locales.map((locale) => [locale, locale === 'es' || (offers.length > 0 && offers.every((offer) => offer.translations[locale]))]),
  ) as Translations;

export class ListSitemapEntries {
  constructor(private readonly repository: ContentRepository) {}

  async execute(): Promise<SitemapEntry[]> {
    const [home, facets, brands, obra, printsContent, series, bookingOffers] = await Promise.all([
      this.repository.getHome('es'),
      this.repository.getFacets('es'),
      this.repository.getBrands('es'),
      this.repository.getObra('es'),
      this.repository.getPrintsContent('es'),
      this.repository.getSeries('es'),
      this.repository.getBookingOffers('es'),
    ]);
    const pages: SitemapPage[] = [
      { targetFor: () => ({ route: 'home' }), translations: home.translations },
      ...facets
        .filter((facet) => facet.slug !== 'marcas')
        .map((facet): SitemapPage => ({ targetFor: () => ({ route: facet.slug }), translations: facet.translations })),
      { targetFor: () => ({ route: 'marcas' }), translations: brands.translations },
      { targetFor: () => ({ route: 'obra' }), translations: obra.translations },
      { targetFor: () => ({ route: 'copias' }), translations: printsContent.translations },
      { targetFor: () => ({ route: 'reservas' }), translations: bookingTranslations(bookingOffers) },
      ...series.map(
        (item): SitemapPage => ({
          targetFor: (locale) => ({ route: 'serie', slug: item.slugs[locale] }),
          translations: item.translations,
        }),
      ),
    ];
    return pages.flatMap(entriesOf);
  }
}

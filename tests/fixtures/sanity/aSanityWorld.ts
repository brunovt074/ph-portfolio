import { beforeAfterQuery } from '@/infrastructure/sanity/queries/beforeAfterQuery';
import { bookingOffersQuery } from '@/infrastructure/sanity/queries/bookingOffersQuery';
import { brandPackagesQuery } from '@/infrastructure/sanity/queries/brandPackagesQuery';
import { brandsQuery } from '@/infrastructure/sanity/queries/brandsQuery';
import { facetsQuery } from '@/infrastructure/sanity/queries/facetsQuery';
import { homeQuery } from '@/infrastructure/sanity/queries/homeQuery';
import { obraQuery } from '@/infrastructure/sanity/queries/obraQuery';
import { printsPageQuery } from '@/infrastructure/sanity/queries/printsPageQuery';
import { printsQuery } from '@/infrastructure/sanity/queries/printsQuery';
import { schedulingQuery } from '@/infrastructure/sanity/queries/schedulingQuery';
import { seriesQuery } from '@/infrastructure/sanity/queries/seriesQuery';
import { settingsQuery } from '@/infrastructure/sanity/queries/settingsQuery';
import { siteTextsQuery } from '@/infrastructure/sanity/queries/siteTextsQuery';
import { FakeSanityClient } from '../../fakes/FakeSanityClient';
import { aSanityBookingOffer } from './aSanityBookingOffer';
import { aSanityBeforeAfter, aSanityBrands, aSanityPackage } from './aSanityBrands';
import { aSanityFacet } from './aSanityFacet';
import { aSanityHome } from './aSanityHome';
import { aSanityObra, aSanityPrint, aSanityPrintsPage, aSanitySeries } from './aSanityObra';
import { aSanitySettings } from './aSanitySettings';
import { aSanitySiteTexts } from './aSanitySiteTexts';

export interface SanityWorld {
  settings: unknown;
  home: unknown;
  facets: unknown;
  brands: unknown;
  packages: unknown;
  beforeAfter: unknown;
  obra: unknown;
  series: unknown;
  prints: unknown;
  printsPage: unknown;
  bookingOffers: unknown;
  scheduling: unknown;
  siteTexts: unknown;
}

export const aSanityClient = (overrides: Partial<SanityWorld> = {}): FakeSanityClient => {
  const world: SanityWorld = {
    settings: aSanitySettings(),
    home: aSanityHome(),
    facets: [aSanityFacet()],
    brands: aSanityBrands(),
    packages: [aSanityPackage()],
    beforeAfter: [aSanityBeforeAfter()],
    obra: aSanityObra(),
    series: [aSanitySeries()],
    prints: [aSanityPrint()],
    printsPage: aSanityPrintsPage(),
    bookingOffers: [aSanityBookingOffer()],
    scheduling: null,
    siteTexts: aSanitySiteTexts(),
    ...overrides,
  };
  return new FakeSanityClient(
    new Map<string, unknown>([
      [settingsQuery, world.settings],
      [homeQuery, world.home],
      [facetsQuery, world.facets],
      [brandsQuery, world.brands],
      [brandPackagesQuery, world.packages],
      [beforeAfterQuery, world.beforeAfter],
      [obraQuery, world.obra],
      [seriesQuery, world.series],
      [printsQuery, world.prints],
      [printsPageQuery, world.printsPage],
      [bookingOffersQuery, world.bookingOffers],
      [schedulingQuery, world.scheduling],
      [siteTextsQuery, world.siteTexts],
    ]),
  );
};

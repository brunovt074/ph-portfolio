import type { BookingOffer } from '@/domain/booking/BookingOffer';
import type { BrandsContent } from '@/domain/BrandsContent';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { Facet } from '@/domain/Facet';
import type { HomeContent } from '@/domain/HomeContent';
import type { HomeDoor } from '@/domain/HomeDoor';
import type { ObraContent } from '@/domain/ObraContent';
import type { Photo } from '@/domain/Photo';
import type { Locale } from '@/domain/Locale';
import { pathTo } from '@/domain/routing/pathTo';
import type { Print } from '@/domain/Print';
import type { PrintsContent } from '@/domain/PrintsContent';
import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';
import type { Series } from '@/domain/Series';
import type { SeriesLayout } from '@/domain/SeriesLayout';
import type { Service } from '@/domain/Service';
import type { SiteSettings } from '@/domain/SiteSettings';
import type { SiteTexts } from '@/domain/SiteTexts';
import type { Translations } from '@/domain/Translations';
import { defaultSiteTexts } from '@/infrastructure/texts/defaults/defaultSiteTexts';
import type { ContentData } from './data/ContentData';
import type { ContentDoor } from './data/ContentDoor';
import type { ContentService } from './data/ContentService';
import type { SeedData } from './data/SeedData';
import type { SeedPhoto } from './data/SeedPhoto';
import type { SeedSeries } from './data/SeedSeries';
import type { SeedSeriesPhoto } from './data/SeedSeriesPhoto';
import { MissingContentError } from './MissingContentError';
import { parseRichTitle } from './parseRichTitle';
import { UnknownPhotoError } from './UnknownPhotoError';

const PORTRAIT_ID = 'retrato';

const spanishOnly = (): Translations => ({ es: true, en: false, pt: false });

const layouts: Record<SeedSeriesPhoto['layout'], SeriesLayout> = {
  centro: 'center',
  izquierda: 'left',
  derecha: 'right',
  par: 'pair',
  sangre: 'bleed',
};

export class SeedContentRepository implements ContentRepository {
  private readonly photos: Map<string, Photo>;

  constructor(
    private readonly seed: SeedData,
    private readonly content: ContentData,
  ) {
    this.photos = new Map(this.seed.fotos.map((photo) => [photo.id, this.toPhoto(photo)]));
  }

  async getSettings(_locale: Locale): Promise<SiteSettings> {
    const { ajustes } = this.seed;
    return {
      email: ajustes.email,
      whatsapp: ajustes.whatsapp,
      instagram: ajustes.instagram,
      quote: ajustes.frase,
      about: ajustes.sobre_mi,
      portrait: {
        id: PORTRAIT_ID,
        asset: { provider: 'local', ref: PORTRAIT_ID },
        alt: this.content.settings.portraitAlt,
        facet: 'retratos',
        featured: false,
      },
      artistStatement: ajustes.statement,
      exhibitions: this.content.settings.exhibitions,
      printInfo: this.content.prints.info,
    };
  }

  async getHome(locale: Locale): Promise<HomeContent> {
    const { home } = this.content;
    return {
      lead: home.lead,
      encargosDoor: this.toDoor(home.doors.encargos, pathTo(locale, { route: 'home', hash: 'encargos' })),
      obraDoor: this.toDoor(home.doors.obra, pathTo(locale, { route: 'obra' })),
      ticker: home.ticker,
      aboutCta: home.about.cta,
      encargosEyebrow: home.encargos.eyebrow,
      encargosTitle: parseRichTitle(home.encargos.title),
      facetThumbnails: {
        editorial: this.photosOf(home.encargos.thumbnails.editorial),
        retratos: this.photosOf(home.encargos.thumbnails.retratos),
        marcas: this.photosOf(home.encargos.thumbnails.marcas),
        eventos: this.photosOf(home.encargos.thumbnails.eventos),
      },
      editorialStrip: this.photosOf(home.editorialStrip),
      brandsEyebrow: home.brands.eyebrow,
      brandsTitle: parseRichTitle(home.brands.title),
      brandServices: home.brands.services.map(toService),
      brandsCta: home.brands.cta,
      brandGrid: this.photosOf(home.brands.grid),
      obraTeaserTitle: parseRichTitle(home.obraTeaser.title),
      obraTeaserLead: home.obraTeaser.lead,
      obraTeaserPhotos: this.photosOf(home.obraTeaser.photos),
      obraTeaserCta: home.obraTeaser.cta,
      contactTitle: home.contact.title,
      contactLead: home.contact.lead,
      workTypes: home.contact.workTypes,
      translations: spanishOnly(),
    };
  }

  async getFacets(_locale: Locale): Promise<Facet[]> {
    return [...this.content.facets]
      .sort((first, second) => first.number - second.number)
      .map((facet) => ({
        slug: facet.slug,
        number: facet.number,
        name: facet.name,
        title: parseRichTitle(facet.title),
        lead: facet.lead,
        indexDescription: facet.indexDescription,
        cover: this.photosOf(facet.cover),
        gallery: this.photosOf(facet.gallery),
        services: facet.services.map(toService),
        ...(facet.quote !== undefined && { quote: parseRichTitle(facet.quote) }),
        ctaText: facet.ctaText,
        ctaButton: facet.ctaButton,
        translations: spanishOnly(),
      }));
  }

  async getBrands(_locale: Locale): Promise<BrandsContent> {
    const { brands } = this.content;
    return {
      headerCta: brands.headerCta,
      sectorsTitle: brands.sectorsTitle,
      sectors: brands.sectors.map((sector) => ({
        title: sector.title,
        description: sector.description,
        photo: this.photo(sector.photo),
      })),
      moreWorkTitle: brands.moreWorkTitle,
      beforeAfterTitle: parseRichTitle(brands.beforeAfter.title),
      beforeAfterLead: brands.beforeAfter.lead,
      beforeAfter: brands.beforeAfter.pairs.map((pair) => ({
        before: this.photo(pair.before),
        after: this.photo(pair.after),
        alt: pair.alt,
        provisional: pair.provisional,
      })),
      processTitle: parseRichTitle(brands.process.title),
      steps: brands.process.steps,
      packagesTitle: brands.packagesTitle,
      packagesCta: brands.packagesCta,
      packages: this.seed.paquetesMarca.map((pack, order) => ({
        name: pack.nombre,
        price: pack.precio,
        items: pack.items,
        featured: pack.destacado ?? false,
        order,
      })),
      translations: spanishOnly(),
    };
  }

  async getObra(locale: Locale): Promise<ObraContent> {
    const { obra } = this.content;
    const prints = await this.getPrints(locale);
    return {
      opening: {
        photo: this.photo(obra.opening.photo),
        seriesNumber: obra.opening.seriesNumber,
        seriesTitle: obra.opening.seriesTitle,
        caption: parseRichTitle(obra.opening.caption),
      },
      quote: obra.quote,
      seriesTitle: obra.seriesTitle,
      aboutTitle: parseRichTitle(obra.aboutTitle),
      exhibitionsTitle: obra.exhibitionsTitle,
      printsTeaser: {
        title: parseRichTitle(obra.printsTeaser.title),
        lead: obra.printsTeaser.lead,
        cta: obra.printsTeaser.cta,
        photos: prints.slice(0, 3).map((print) => print.photo),
      },
      seriesPrintsBand: {
        title: parseRichTitle(obra.seriesPrintsBand.title),
        cta: obra.seriesPrintsBand.cta,
      },
      translations: spanishOnly(),
    };
  }

  async getSeries(_locale: Locale): Promise<Series[]> {
    const { obra } = this.content;
    return this.seed.series.map((series) => ({
      number: series.numero,
      slug: this.slugOf(series),
      slugs: this.slugsOf(series),
      title: series.titulo,
      displayTitle: parseRichTitle(this.requiredBySeries(obra.seriesDisplayTitles, series, 'series display title')),
      years: series.anios,
      curatorialLine: series.lineaCuratorial,
      curatorialText: this.requiredBySeries(obra.seriesCuratorialTexts, series, 'series curatorial text'),
      photos: series.fotos.map((entry) => ({ photo: this.photo(entry.foto), layout: layouts[entry.layout] })),
      translations: spanishOnly(),
    }));
  }

  async getPrints(_locale: Locale): Promise<Print[]> {
    return this.seed.copias.map((copy) => {
      const owner = this.seed.series.find((series) => series.fotos.some((entry) => entry.foto === copy.foto));
      if (!owner) {
        throw new UnknownPhotoError(copy.foto);
      }
      return {
        id: `copia-${copy.foto}`,
        photo: this.photo(copy.foto),
        series: { number: owner.numero, slug: this.slugOf(owner), title: owner.titulo },
        edition: copy.edicion,
        available: copy.disponibles,
        sizes: copy.tamanos.map((size) => ({ size: size.medida, price: size.precio })),
        active: true,
      };
    });
  }

  async getPrintsContent(_locale: Locale): Promise<PrintsContent> {
    const { prints } = this.content;
    return {
      title: parseRichTitle(prints.title),
      lead: prints.lead,
      cta: prints.cta,
      editionLabel: prints.editionLabel,
      info: prints.info,
      translations: spanishOnly(),
    };
  }

  async getBookingOffers(_locale: Locale): Promise<BookingOffer[]> {
    return [...this.content.bookingOffers]
      .sort((first, second) => first.order - second.order)
      .map((offer) => ({
        slug: offer.slug,
        title: offer.title,
        description: offer.description,
        facet: offer.facet,
        priceCents: offer.price === null ? null : offer.price * 100,
        depositPercent: offer.depositPercent,
        durationMinutes: offer.duration,
        order: offer.order,
        translations: spanishOnly(),
      }));
  }

  async getSchedulingSettings(): Promise<SchedulingSettings> {
    return { ...this.content.scheduling, windows: [...this.content.scheduling.windows] };
  }

  async getTexts(locale: Locale): Promise<SiteTexts> {
    return defaultSiteTexts[locale];
  }

  private slugOf(series: SeedSeries): string {
    return this.requiredBySeries(this.content.obra.seriesSlugs, series, 'series slug');
  }

  private slugsOf(series: SeedSeries): Record<Locale, string> {
    const slug = this.slugOf(series);
    return { es: slug, en: slug, pt: slug };
  }

  private requiredBySeries(entries: Record<string, string>, series: SeedSeries, section: string): string {
    const value = entries[series.numero];
    if (value === undefined) {
      throw new MissingContentError(section, series.numero);
    }
    return value;
  }

  private toDoor(door: ContentDoor, href: string): HomeDoor {
    return {
      photo: this.photo(door.photo),
      label: door.label,
      title: parseRichTitle(door.title),
      subtitle: door.subtitle,
      href,
    };
  }

  private photosOf(ids: string[]): Photo[] {
    return ids.map((id) => this.photo(id));
  }

  private photo(id: string): Photo {
    const photo = this.photos.get(id);
    if (!photo) {
      throw new UnknownPhotoError(id);
    }
    return photo;
  }

  private toPhoto(photo: SeedPhoto): Photo {
    return {
      id: photo.id,
      asset: { provider: 'local', ref: photo.id, ...(photo.hotspot !== undefined && { hotspot: { x: photo.hotspot.x, y: photo.hotspot.y } }) },
      alt: photo.alt,
      facet: photo.faceta,
      featured: photo.destacada ?? false,
      ...(photo.titulo !== undefined && { title: photo.titulo }),
      ...(photo.titulo_provisorio !== undefined && { provisionalTitle: photo.titulo_provisorio }),
      ...(photo.lugar !== undefined && { place: photo.lugar }),
      ...(photo.anio !== undefined && { year: photo.anio }),
    };
  }
}

const toService = (service: ContentService): Service => ({
  title: service.title,
  ...(service.description !== undefined && { description: service.description }),
  ...(service.price !== undefined && { price: service.price }),
});

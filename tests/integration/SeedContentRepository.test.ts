import { describe, expect, it } from 'vitest';
import content from '../../assets/content.json';
import seed from '../../assets/seed.json';
import type { ContentData } from '@/infrastructure/seed/data/ContentData';
import type { SeedData } from '@/infrastructure/seed/data/SeedData';
import { defaultSiteTexts } from '@/infrastructure/texts/defaults/defaultSiteTexts';
import { SeedContentRepository } from '@/infrastructure/seed/SeedContentRepository';
import { MissingContentError } from '@/infrastructure/seed/MissingContentError';
import { UnknownPhotoError } from '@/infrastructure/seed/UnknownPhotoError';

const realSeed = seed as SeedData;
const realContent = content as ContentData;

const repository = () => new SeedContentRepository(realSeed, realContent);
const cloneContent = () => structuredClone(realContent);
const cloneSeed = () => structuredClone(realSeed);

describe('SeedContentRepository with the real handoff data', () => {
  it('resolves every photo referenced by the content out of the 65 in the seed', async () => {
    const facets = await repository().getFacets('es');
    const home = await repository().getHome('es');
    const brands = await repository().getBrands('es');
    const series = await repository().getSeries('es');
    const ids = new Set<string>();
    facets.forEach((facet) => [...facet.cover, ...facet.gallery].forEach((photo) => ids.add(photo.id)));
    Object.values(home.facetThumbnails).forEach((photos) => photos.forEach((photo) => ids.add(photo.id)));
    home.editorialStrip.forEach((photo) => ids.add(photo.id));
    home.brandGrid.forEach((photo) => ids.add(photo.id));
    home.obraTeaserPhotos.forEach((photo) => ids.add(photo.id));
    brands.sectors.forEach((sector) => ids.add(sector.photo.id));
    series.forEach((item) => item.photos.forEach((entry) => ids.add(entry.photo.id)));

    expect(realSeed.fotos).toHaveLength(65);
    expect(ids.size).toBeGreaterThan(40);
    expect(home.encargosDoor.photo.id).toBe('ed02');
    expect(home.obraDoor.photo.id).toBe('au01');
    expect(home.obraDoor.title).toEqual([{ text: 'Obra', italic: true }]);
  });

  it('keeps the landing hero photo framed on the face so the Encargos label never hides it', async () => {
    const home = await repository().getHome('es');

    expect(home.encargosDoor.photo.asset.hotspot).toEqual({ x: 0.445, y: 0.18 });
  });

  it('keeps the four facets ordered by number even if the content lists them shuffled', async () => {
    const shuffled = cloneContent();
    shuffled.facets.reverse();

    const facets = await new SeedContentRepository(realSeed, shuffled).getFacets('es');

    expect(facets.map((facet) => facet.slug)).toEqual(['editorial', 'retratos', 'marcas', 'eventos']);
    expect(facets[0]?.title).toEqual([
      { text: 'Imagen con ', italic: false },
      { text: 'actitud', italic: true },
    ]);
    expect(facets[1]?.quote).toBeDefined();
    expect(facets[0]?.quote).toBeUndefined();
    expect(facets[1]?.services[0]?.price).toBe('[PRECIO]');
    expect(facets[0]?.services[0]?.price).toBeUndefined();
    expect(facets[2]?.services).toEqual([]);
  });

  it('builds the four series with the expected slugs, layouts and display titles', async () => {
    const series = await repository().getSeries('es');

    expect(series.map((item) => item.slug)).toEqual(['oficios', 'geometrias', 'lo-que-queda', 'viajes-en-color']);
    expect(series.map((item) => item.number)).toEqual(['I', 'II', 'III', 'IV']);
    expect(series[0]?.photos.map((entry) => entry.layout)).toEqual(['center', 'left', 'right', 'bleed']);
    expect(series[1]?.photos.some((entry) => entry.layout === 'pair')).toBe(true);
    expect(series[0]?.displayTitle).toEqual([
      { text: 'Ofi', italic: false },
      { text: 'cios', italic: true },
    ]);
    expect(series[0]?.curatorialText).toBe('[Texto curatorial de la serie]');
  });

  it('links each of the 6 prints to the series that contains its photo', async () => {
    const prints = await repository().getPrints('es');
    const bySeries = Object.fromEntries(prints.map((print) => [print.id, print.series.slug]));

    expect(prints).toHaveLength(6);
    expect(bySeries).toEqual({
      'copia-au03': 'geometrias',
      'copia-au01': 'oficios',
      'copia-au14': 'lo-que-queda',
      'copia-au18': 'lo-que-queda',
      'copia-au17': 'geometrias',
      'copia-au08': 'viajes-en-color',
    });
    expect(prints.every((print) => print.active && print.available === null)).toBe(true);
    expect(prints[0]?.sizes[0]).toEqual({ size: '30 × 40 cm', price: '[PRECIO]' });
  });

  it('keeps the available count of a print that already has a numbered stock', async () => {
    const withStock = cloneSeed();
    const first = withStock.copias[0];
    if (first) {
      first.disponibles = 7;
    }

    const prints = await new SeedContentRepository(withStock, realContent).getPrints('es');

    expect(prints[0]?.available).toBe(7);
  });

  it('offers 3 brand packages with Identidad as the featured one', async () => {
    const { packages } = await repository().getBrands('es');

    expect(packages.map((pack) => pack.name)).toEqual(['Esencial', 'Identidad', 'Mensual']);
    expect(packages.map((pack) => pack.featured)).toEqual([false, true, false]);
    expect(packages.map((pack) => pack.order)).toEqual([0, 1, 2]);
  });

  it('marks the before and after pair as provisional until Lara uploads the real retouch', async () => {
    const brands = await repository().getBrands('es');

    expect(brands.beforeAfter).toHaveLength(1);
    expect(brands.beforeAfter[0]?.before.id).toBe('mk01');
    expect(brands.beforeAfter[0]?.provisional).toBe(true);
    expect(brands.steps).toHaveLength(4);
    expect(brands.sectors).toHaveLength(4);
    expect(brands.beforeAfterTitle).toEqual([
      { text: 'El ', italic: false },
      { text: 'retoque', italic: true },
      { text: ' hace la diferencia', italic: false },
    ]);
  });

  it('exposes the obra manifesto, opening photo and the first three print photos for the teaser', async () => {
    const obra = await repository().getObra('es');

    expect(obra.opening.photo.id).toBe('au05');
    expect(obra.printsTeaser.photos.map((photo) => photo.id)).toEqual(['au03', 'au01', 'au14']);
    expect(obra.seriesPrintsBand.cta).toBe('Ver copias');
    expect(obra.opening.caption[0]).toEqual({ text: 'Sin título', italic: true });
  });

  it('keeps provisional titles, placeholders and null years on obra photos only', async () => {
    const series = await repository().getSeries('es');
    const bidones = series[0]?.photos[0]?.photo;
    const home = await repository().getHome('es');

    expect(bidones?.title).toBe('Bidones');
    expect(bidones?.provisionalTitle).toBe(true);
    expect(bidones?.place).toBe('[Ciudad]');
    expect(bidones?.year).toBeNull();
    expect(home.facetThumbnails.editorial[0]?.title).toBeUndefined();
    expect(home.facetThumbnails.editorial[0]?.featured).toBe(true);
    expect(home.facetThumbnails.retratos[2]?.featured).toBe(false);
  });

  it('builds the settings with the portrait, exhibitions placeholder and print info', async () => {
    const settings = await repository().getSettings('es');

    expect(settings.portrait.id).toBe('retrato-lara');
    expect(settings.portrait.alt).toBe('Sarah Moreau con su cámara profesional entre las manos, mirando de frente, en blanco y negro');
    expect(settings.portrait.facet).toBe('retratos');
    expect(settings.portrait.featured).toBe(false);
    expect(settings.quote).toBe('Cada fotografía es un registro de nuestro paso.');
    expect(settings.instagram).toHaveLength(3);
    expect(settings.exhibitions).toHaveLength(1);
    expect(settings.printInfo).toHaveLength(4);
    expect(settings.email).toBe('[EMAIL]');
  });

  it('serves the default interface texts of the requested language', async () => {
    const texts = await repository().getTexts('pt');

    expect(texts).toBe(defaultSiteTexts.pt);
  });

  it('maps the home content and the prints page content', async () => {
    const home = await repository().getHome('es');
    const printsContent = await repository().getPrintsContent('es');

    expect(home.encargosTitle).toEqual([
      { text: 'Cuatro ', italic: false },
      { text: 'miradas', italic: true },
    ]);
    expect(home.brandServices[0]).toEqual({ title: 'Producto & e-commerce', price: 'desde [PRECIO]' });
    expect(home.workTypes).toHaveLength(6);
    expect(home.ticker).toHaveLength(5);
    expect(printsContent.title).toEqual([
      { text: 'Copias ', italic: false },
      { text: 'de autor', italic: true },
    ]);
    expect(printsContent.info).toHaveLength(4);
  });

  it('refuses to publish a series that has no slug yet', async () => {
    const incomplete = cloneContent();
    incomplete.obra.seriesSlugs = {};

    const failure = new SeedContentRepository(realSeed, incomplete).getSeries('es');

    await expect(failure).rejects.toBeInstanceOf(MissingContentError);
    await expect(failure).rejects.toThrow('Missing content for series slug: I');
  });

  it('refuses to publish a series that has no display title yet', async () => {
    const incomplete = cloneContent();
    incomplete.obra.seriesDisplayTitles = {};

    const failure = new SeedContentRepository(realSeed, incomplete).getSeries('es');

    await expect(failure).rejects.toThrow('Missing content for series display title: I');
  });

  it('refuses to publish a series that has no curatorial text yet', async () => {
    const incomplete = cloneContent();
    incomplete.obra.seriesCuratorialTexts = {};

    const failure = new SeedContentRepository(realSeed, incomplete).getSeries('es');

    await expect(failure).rejects.toThrow('Missing content for series curatorial text: I');
  });

  it('fails with UnknownPhotoError when the content references a photo that does not exist', async () => {
    const broken = cloneContent();
    const door = broken.home.doors.encargos;
    door.photo = 'zz99';

    const failure = new SeedContentRepository(realSeed, broken).getHome('es');

    await expect(failure).rejects.toBeInstanceOf(UnknownPhotoError);
    await expect(failure).rejects.toThrow('Unknown photo id: zz99');
  });

  it('fails with UnknownPhotoError when a print points to a photo that belongs to no series', async () => {
    const broken = cloneSeed();
    const first = broken.copias[0];
    if (first) {
      first.foto = 'ed01';
    }

    await expect(new SeedContentRepository(broken, realContent).getPrints('es')).rejects.toBeInstanceOf(UnknownPhotoError);
  });

  it('serves Spanish content and the requested language texts in seed mode', async () => {
    const english = await repository().getHome('en');

    expect(english.lead).toBe((await repository().getHome('es')).lead);
    expect(await repository().getTexts('en')).toEqual(defaultSiteTexts.en);
  });

  it('points the home doors to the visitor language', async () => {
    const home = await repository().getHome('pt');

    expect(home.encargosDoor.href).toBe('/pt/#encargos');
    expect(home.obraDoor.href).toBe('/pt/obra');
  });

  it('gives every seed series the same slug in all languages', async () => {
    const [series] = await repository().getSeries('en');

    expect(series?.slugs).toEqual({ es: 'oficios', en: 'oficios', pt: 'oficios' });
  });

  it('marks every seed page as Spanish only', async () => {
    const spanishOnly = { es: true, en: false, pt: false };
    const [facet] = await repository().getFacets('en');
    const [series] = await repository().getSeries('en');

    expect((await repository().getHome('en')).translations).toEqual(spanishOnly);
    expect(facet?.translations).toEqual(spanishOnly);
    expect((await repository().getBrands('en')).translations).toEqual(spanishOnly);
    expect((await repository().getObra('en')).translations).toEqual(spanishOnly);
    expect(series?.translations).toEqual(spanishOnly);
    expect((await repository().getPrintsContent('en')).translations).toEqual(spanishOnly);
  });

  it('offers the four portrait sessions as bookable without any invented price', async () => {
    const offers = await repository().getBookingOffers('es');

    expect(offers.map((offer) => offer.slug)).toEqual(['retrato-personal', 'maternidad', 'familias', 'marca-personal']);
    expect(
      offers.every((offer) => offer.priceCents === null && offer.durationMinutes === null && offer.depositPercent === 50 && offer.facet === 'retratos'),
    ).toBe(true);
    expect(offers[1]).toMatchObject({ title: 'Maternidad', description: 'La espera, en clave íntima y sin apuro.', order: 2 });
  });

  it('keeps the booking offers ordered even if the content lists them shuffled and converts pesos to cents', async () => {
    const shuffled = cloneContent();
    shuffled.bookingOffers.reverse();
    const [first] = shuffled.bookingOffers;
    if (first) {
      first.price = 1500;
    }

    const offers = await new SeedContentRepository(realSeed, shuffled).getBookingOffers('es');

    expect(offers.map((offer) => offer.order)).toEqual([1, 2, 3, 4]);
    expect(offers[3]?.priceCents).toBe(150_000);
  });

  it('starts with no weekly windows so every session is booked by a proposed date until Lara loads her agenda', async () => {
    expect(await repository().getSchedulingSettings()).toEqual({
      timeZone: 'America/Argentina/Buenos_Aires',
      windows: [],
      slotStepMinutes: 30,
      bufferMinutes: 30,
      minNoticeHours: 48,
      horizonDays: 90,
      holdMinutes: 30,
    });
  });

  it('passes the duration of a session in minutes', async () => {
    const timed = cloneContent();
    const [first] = timed.bookingOffers;
    if (first) {
      first.duration = 90;
    }

    const offers = await new SeedContentRepository(realSeed, timed).getBookingOffers('es');

    expect(offers[0]?.durationMinutes).toBe(90);
  });
});

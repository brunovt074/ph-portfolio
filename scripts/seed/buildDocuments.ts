import type { ContentData } from '../../src/infrastructure/seed/data/ContentData';
import type { ContentService } from '../../src/infrastructure/seed/data/ContentService';
import type { SeedData } from '../../src/infrastructure/seed/data/SeedData';
import { toPortableText } from './portableText';
import { imageField, reference, referenceList, withKeys } from './references';
import type { SeedDocument } from './SeedDocument';
import { slugify } from './slugify';

export const PORTRAIT_ID = 'retrato-sarah';

export type AssetIdOf = (imageId: string) => string;

const photoId = (id: string) => `foto-${id}`;
const photoIds = (ids: string[]) => ids.map(photoId);

const es = (value: unknown) => ({ es: value });
const localizedTitle = (marked: string, keyPrefix: string) => es(toPortableText(marked, keyPrefix));

const services = (items: ContentService[], prefix: string) =>
  withKeys(
    prefix,
    items.map((item) => ({
      titulo: es(item.title),
      ...(item.description !== undefined && { descripcion: es(item.description) }),
      ...(item.price !== undefined && { precio: es(item.price) }),
    })),
  );

export const buildDocuments = (seed: SeedData, content: ContentData, assetIdOf: AssetIdOf): SeedDocument[] => {
  const { home, brands, obra, prints, settings } = content;
  const seriesSlug = (numero: string) => obra.seriesSlugs[numero] ?? numero;

  const photos: SeedDocument[] = seed.fotos.map((photo) => ({
    _id: photoId(photo.id),
    _type: 'foto',
    imagen: imageField(assetIdOf(photo.id)),
    alt: es(photo.alt),
    ...(photo.titulo !== undefined && { titulo: es(photo.titulo) }),
    ...(photo.titulo_provisorio !== undefined && { tituloProvisorio: photo.titulo_provisorio }),
    ...(photo.lugar !== undefined && { lugar: photo.lugar }),
    ...(photo.anio != null && { anio: photo.anio }),
    facetas: photo.faceta === 'obra' ? [] : referenceList('faceta', [`faceta-${photo.faceta}`]),
    destacada: photo.destacada ?? false,
  }));

  const facets: SeedDocument[] = content.facets.map((facet) => ({
    _id: `faceta-${facet.slug}`,
    _type: 'faceta',
    nombre: es(facet.name),
    slug: { _type: 'slug', current: facet.slug },
    numero: facet.number,
    titulo: localizedTitle(facet.title, `faceta-${facet.slug}-titulo`),
    lead: es(facet.lead),
    indexDescription: es(facet.indexDescription),
    ...(facet.quote !== undefined && { quote: localizedTitle(facet.quote, `faceta-${facet.slug}-quote`) }),
    portada: referenceList('portada', photoIds(facet.cover)),
    galeria: referenceList('galeria', photoIds(facet.gallery)),
    servicios: services(facet.services, 'servicio').map((service) => ({ _type: 'servicio', ...service })),
    ctaTexto: es(facet.ctaText),
    ctaButton: es(facet.ctaButton),
  }));

  const packages: SeedDocument[] = seed.paquetesMarca.map((pack, index) => ({
    _id: `paquete-${slugify(pack.nombre)}`,
    _type: 'paqueteMarca',
    nombre: es(pack.nombre),
    precio: es(pack.precio),
    items: es(pack.items),
    destacado: pack.destacado ?? false,
    orden: index + 1,
  }));

  const beforeAfter: SeedDocument[] = brands.beforeAfter.pairs.map((pair, index) => ({
    _id: `antesDespues-${index + 1}`,
    _type: 'antesDespues',
    antes: imageField(assetIdOf(pair.before)),
    despues: imageField(assetIdOf(pair.after)),
    alt: es(pair.alt),
    provisorio: pair.provisional,
    orden: index + 1,
  }));

  const series: SeedDocument[] = seed.series.map((entry, index) => ({
    _id: `serie-${seriesSlug(entry.numero)}`,
    _type: 'serie',
    numero: entry.numero,
    orden: index + 1,
    titulo: es(entry.titulo),
    tituloVisible: localizedTitle(obra.seriesDisplayTitles[entry.numero] ?? entry.titulo, `serie-${entry.numero}-titulo`),
    slug: es({ _type: 'slug', current: seriesSlug(entry.numero) }),
    anios: entry.anios,
    lineaCuratorial: es(entry.lineaCuratorial),
    textoCuratorial: es(obra.seriesCuratorialTexts[entry.numero] ?? ''),
    fotos: entry.fotos.map((item, position) => ({
      _key: `foto-${position}`,
      _type: 'fotoDeSerie',
      foto: reference(photoId(item.foto)),
      layout: item.layout,
    })),
  }));

  const printDocuments: SeedDocument[] = seed.copias.map((copy, index) => {
    const owner = seed.series.find((entry) => entry.fotos.some((item) => item.foto === copy.foto));
    return {
      _id: `copia-${copy.foto}`,
      _type: 'copia',
      foto: reference(photoId(copy.foto)),
      serie: reference(`serie-${seriesSlug(owner?.numero ?? '')}`),
      orden: index + 1,
      edicion: copy.edicion,
      ...(copy.disponibles !== null && { disponibles: copy.disponibles }),
      tamanos: withKeys('tamano', copy.tamanos.map((size) => ({ _type: 'tamano', medida: size.medida, precio: size.precio }))),
      activa: true,
    };
  });

  const settingsDocument: SeedDocument = {
    _id: 'ajustes',
    _type: 'ajustes',
    email: seed.ajustes.email,
    whatsapp: seed.ajustes.whatsapp,
    instagram: seed.ajustes.instagram,
    frase: es(seed.ajustes.frase),
    sobreMi: es(seed.ajustes.sobre_mi),
    retrato: imageField(assetIdOf(PORTRAIT_ID)),
    retratoAlt: es(settings.portraitAlt),
    statement: es(seed.ajustes.statement),
    muestras: withKeys('muestra', settings.exhibitions.map((show) => ({ _type: 'muestra', titulo: es(show.title), lugar: show.place, anio: show.year }))),
    infoCopias: withKeys('info', prints.info.map((item) => ({ _type: 'itemInfo', titulo: es(item.title), descripcion: es(item.description) }))),
  };

  const homeDocument: SeedDocument = {
    _id: 'paginaInicio',
    _type: 'paginaInicio',
    bajada: es(home.lead),
    puertaEncargosFoto: reference(photoId(home.doors.encargos.photo)),
    puertaEncargosEtiqueta: es(home.doors.encargos.label),
    puertaEncargosTitulo: localizedTitle(home.doors.encargos.title, 'home-puerta-encargos'),
    puertaEncargosSubtitulo: es(home.doors.encargos.subtitle),
    puertaObraFoto: reference(photoId(home.doors.obra.photo)),
    puertaObraEtiqueta: es(home.doors.obra.label),
    puertaObraTitulo: localizedTitle(home.doors.obra.title, 'home-puerta-obra'),
    puertaObraSubtitulo: es(home.doors.obra.subtitle),
    ticker: es(home.ticker),
    sobreMiCta: es(home.about.cta),
    encargosEyebrow: es(home.encargos.eyebrow),
    encargosTitulo: localizedTitle(home.encargos.title, 'home-encargos'),
    miniaturasEditorial: referenceList('editorial', photoIds(home.encargos.thumbnails.editorial)),
    miniaturasRetratos: referenceList('retratos', photoIds(home.encargos.thumbnails.retratos)),
    miniaturasMarcas: referenceList('marcas', photoIds(home.encargos.thumbnails.marcas)),
    miniaturasEventos: referenceList('eventos', photoIds(home.encargos.thumbnails.eventos)),
    tiraEditorial: referenceList('tira', photoIds(home.editorialStrip)),
    marcasEyebrow: es(home.brands.eyebrow),
    marcasTitulo: localizedTitle(home.brands.title, 'home-marcas'),
    marcasServicios: services(home.brands.services, 'servicio').map((service) => ({ _type: 'servicio', ...service })),
    marcasCta: es(home.brands.cta),
    marcasGrilla: referenceList('grilla', photoIds(home.brands.grid)),
    obraTitulo: localizedTitle(home.obraTeaser.title, 'home-obra'),
    obraBajada: es(home.obraTeaser.lead),
    obraFotos: referenceList('obra', photoIds(home.obraTeaser.photos)),
    obraCta: es(home.obraTeaser.cta),
    contactoTitulo: es(home.contact.title),
    contactoBajada: es(home.contact.lead),
    tiposDeTrabajo: es(home.contact.workTypes),
  };

  const brandsDocument: SeedDocument = {
    _id: 'paginaMarcas',
    _type: 'paginaMarcas',
    ctaCabecera: es(brands.headerCta),
    rubrosTitulo: es(brands.sectorsTitle),
    rubros: withKeys(
      'rubro',
      brands.sectors.map((sector) => ({
        _type: 'rubro',
        titulo: es(sector.title),
        descripcion: es(sector.description),
        foto: reference(photoId(sector.photo)),
      })),
    ),
    masTrabajosTitulo: es(brands.moreWorkTitle),
    antesDespuesTitulo: localizedTitle(brands.beforeAfter.title, 'marcas-antes-despues'),
    antesDespuesBajada: es(brands.beforeAfter.lead),
    procesoTitulo: localizedTitle(brands.process.title, 'marcas-proceso'),
    pasos: withKeys('paso', brands.process.steps.map((step) => ({ _type: 'itemInfo', titulo: es(step.title), descripcion: es(step.description) }))),
    paquetesTitulo: es(brands.packagesTitle),
    paquetesCta: es(brands.packagesCta),
  };

  const obraDocument: SeedDocument = {
    _id: 'paginaObra',
    _type: 'paginaObra',
    aperturaFoto: reference(photoId(obra.opening.photo)),
    aperturaSerieNumero: es(obra.opening.seriesNumber),
    aperturaSerieTitulo: es(obra.opening.seriesTitle),
    aperturaLeyenda: localizedTitle(obra.opening.caption, 'obra-apertura'),
    frase: es(obra.quote),
    seriesTitulo: es(obra.seriesTitle),
    sobreTitulo: localizedTitle(obra.aboutTitle, 'obra-sobre'),
    muestrasTitulo: es(obra.exhibitionsTitle),
    copiasTitulo: localizedTitle(obra.printsTeaser.title, 'obra-copias'),
    copiasBajada: es(obra.printsTeaser.lead),
    copiasCta: es(obra.printsTeaser.cta),
    bandaTitulo: localizedTitle(obra.seriesPrintsBand.title, 'obra-banda'),
    bandaCta: es(obra.seriesPrintsBand.cta),
  };

  const bookingOffers: SeedDocument[] = content.bookingOffers.map((offer) => ({
    _id: `sesion-${offer.slug}`,
    _type: 'sesionReservable',
    titulo: es(offer.title),
    slug: { _type: 'slug', current: offer.slug },
    faceta: reference(`faceta-${offer.facet}`),
    descripcion: es(offer.description),
    ...(offer.duration === null ? {} : { duracionMinutos: offer.duration }),
    porcentajeSena: offer.depositPercent,
    activa: true,
    orden: offer.order,
  }));

  const schedulingDocument: SeedDocument = {
    _id: 'agendaReservas',
    _type: 'agendaReservas',
    ventanas: content.scheduling.windows.map((window) => ({
      _key: `${window.weekday}-${window.from}`,
      _type: 'ventana',
      dia: window.weekday,
      desde: window.from,
      hasta: window.to,
    })),
    pasoMinutos: content.scheduling.slotStepMinutes,
    margenMinutos: content.scheduling.bufferMinutes,
    anticipacionHoras: content.scheduling.minNoticeHours,
    horizonteDias: content.scheduling.horizonDays,
    retencionMinutos: content.scheduling.holdMinutes,
    zonaHoraria: content.scheduling.timeZone,
  };

  const printsPageDocument: SeedDocument = {
    _id: 'paginaCopias',
    _type: 'paginaCopias',
    titulo: localizedTitle(prints.title, 'copias-titulo'),
    bajada: es(prints.lead),
    cta: es(prints.cta),
    etiquetaEdicion: es(prints.editionLabel),
  };

  const siteTextsDocument: SeedDocument = {
    _id: 'textosDelSitio',
    _type: 'textosDelSitio',
  };

  return [
    settingsDocument,
    homeDocument,
    brandsDocument,
    obraDocument,
    printsPageDocument,
    siteTextsDocument,
    ...facets,
    ...photos,
    ...packages,
    ...beforeAfter,
    ...series,
    ...printDocuments,
    ...bookingOffers,
    schedulingDocument,
  ];
};

import type { ContentData } from '../../src/infrastructure/seed/data/ContentData';
import type { ContentService } from '../../src/infrastructure/seed/data/ContentService';
import type { SeedData } from '../../src/infrastructure/seed/data/SeedData';
import { localized, localizedSlug } from './localized';
import { toPortableText } from './portableText';
import { imageField, reference, referenceList, withKeys } from './references';
import type { SeedDocument } from './SeedDocument';
import { slugify } from './slugify';

export const PORTRAIT_ID = 'retrato';

export type AssetIdOf = (imageId: string) => string;

const photoId = (id: string) => `foto-${id}`;
const photoIds = (ids: string[]) => ids.map(photoId);

const services = (items: ContentService[], prefix: string) =>
  withKeys(
    prefix,
    items.map((item) => ({
      _type: 'servicio',
      titulo: localized(item.title),
      ...(item.description !== undefined && { descripcion: localized(item.description) }),
      ...(item.price !== undefined && { precio: localized(item.price) }),
    })),
  );

const infoItems = (prefix: string, items: { title: string; description: string }[]) =>
  withKeys(prefix, items.map((item) => ({ _type: 'itemInfo', titulo: localized(item.title), descripcion: localized(item.description) })));

const rich = (marked: string, keyPrefix: string) => localized(toPortableText(marked, keyPrefix));

export const buildDocuments = (seed: SeedData, content: ContentData, assetIdOf: AssetIdOf): SeedDocument[] => {
  const { home, brands, obra, prints, settings } = content;
  const seriesSlug = (numero: string) => obra.seriesSlugs[numero] ?? numero;

  const photos: SeedDocument[] = seed.fotos.map((photo) => ({
    _id: photoId(photo.id),
    _type: 'foto',
    imagen: imageField(assetIdOf(photo.id), photo.hotspot),
    alt: localized(photo.alt),
    ...(photo.titulo !== undefined && { titulo: localized(photo.titulo) }),
    ...(photo.titulo_provisorio !== undefined && { tituloProvisorio: photo.titulo_provisorio }),
    ...(photo.lugar !== undefined && { lugar: photo.lugar }),
    ...(photo.anio != null && { anio: photo.anio }),
    facetas: photo.faceta === 'obra' ? [] : referenceList('faceta', [`faceta-${photo.faceta}`]),
    destacada: photo.destacada ?? false,
  }));

  const facets: SeedDocument[] = content.facets.map((facet) => ({
    _id: `faceta-${facet.slug}`,
    _type: 'faceta',
    nombre: localized(facet.name),
    slug: { _type: 'slug', current: facet.slug },
    numero: facet.number,
    titulo: rich(facet.title, `faceta-${facet.slug}-titulo`),
    lead: localized(facet.lead),
    indexDescription: localized(facet.indexDescription),
    ...(facet.quote !== undefined && { quote: rich(facet.quote, `faceta-${facet.slug}-quote`) }),
    portada: referenceList('portada', photoIds(facet.cover)),
    galeria: referenceList('galeria', photoIds(facet.gallery)),
    servicios: services(facet.services, 'servicio'),
    ctaTexto: localized(facet.ctaText),
    ctaButton: localized(facet.ctaButton),
  }));

  const packages: SeedDocument[] = seed.paquetesMarca.map((pack, index) => ({
    _id: `paquete-${slugify(pack.nombre)}`,
    _type: 'paqueteMarca',
    nombre: localized(pack.nombre),
    precio: localized(pack.precio),
    items: localized(pack.items),
    destacado: pack.destacado ?? false,
    orden: index + 1,
  }));

  const beforeAfter: SeedDocument[] = brands.beforeAfter.pairs.map((pair, index) => ({
    _id: `antesDespues-${index + 1}`,
    _type: 'antesDespues',
    antes: imageField(assetIdOf(pair.before)),
    despues: imageField(assetIdOf(pair.after)),
    alt: localized(pair.alt),
    provisorio: pair.provisional,
    orden: index + 1,
  }));

  const series: SeedDocument[] = seed.series.map((entry, index) => ({
    _id: `serie-${seriesSlug(entry.numero)}`,
    _type: 'serie',
    numero: entry.numero,
    orden: index + 1,
    titulo: localized(entry.titulo),
    tituloVisible: rich(obra.seriesDisplayTitles[entry.numero] ?? entry.titulo, `serie-${entry.numero}-titulo`),
    slug: localizedSlug(seriesSlug(entry.numero)),
    anios: entry.anios,
    lineaCuratorial: localized(entry.lineaCuratorial),
    textoCuratorial: localized(obra.seriesCuratorialTexts[entry.numero] ?? ''),
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
    frase: localized(seed.ajustes.frase),
    sobreMi: localized(seed.ajustes.sobre_mi),
    retrato: imageField(assetIdOf(PORTRAIT_ID)),
    retratoAlt: localized(settings.portraitAlt),
    statement: localized(seed.ajustes.statement),
    muestras: withKeys('muestra', settings.exhibitions.map((show) => ({ _type: 'muestra', titulo: localized(show.title), lugar: show.place, anio: show.year }))),
    infoCopias: infoItems('info', prints.info),
  };

  const homeDocument: SeedDocument = {
    _id: 'paginaInicio',
    _type: 'paginaInicio',
    bajada: localized(home.lead),
    puertaEncargosFoto: reference(photoId(home.doors.encargos.photo)),
    puertaEncargosEtiqueta: localized(home.doors.encargos.label),
    puertaEncargosTitulo: rich(home.doors.encargos.title, 'home-puerta-encargos'),
    puertaEncargosSubtitulo: localized(home.doors.encargos.subtitle),
    puertaObraFoto: reference(photoId(home.doors.obra.photo)),
    puertaObraEtiqueta: localized(home.doors.obra.label),
    puertaObraTitulo: rich(home.doors.obra.title, 'home-puerta-obra'),
    puertaObraSubtitulo: localized(home.doors.obra.subtitle),
    ticker: localized(home.ticker),
    sobreMiCta: localized(home.about.cta),
    encargosEyebrow: localized(home.encargos.eyebrow),
    encargosTitulo: rich(home.encargos.title, 'home-encargos'),
    miniaturasEditorial: referenceList('editorial', photoIds(home.encargos.thumbnails.editorial)),
    miniaturasRetratos: referenceList('retratos', photoIds(home.encargos.thumbnails.retratos)),
    miniaturasMarcas: referenceList('marcas', photoIds(home.encargos.thumbnails.marcas)),
    miniaturasEventos: referenceList('eventos', photoIds(home.encargos.thumbnails.eventos)),
    tiraEditorial: referenceList('tira', photoIds(home.editorialStrip)),
    marcasEyebrow: localized(home.brands.eyebrow),
    marcasTitulo: rich(home.brands.title, 'home-marcas'),
    marcasServicios: services(home.brands.services, 'servicio'),
    marcasCta: localized(home.brands.cta),
    marcasGrilla: referenceList('grilla', photoIds(home.brands.grid)),
    obraTitulo: rich(home.obraTeaser.title, 'home-obra'),
    obraBajada: localized(home.obraTeaser.lead),
    obraFotos: referenceList('obra', photoIds(home.obraTeaser.photos)),
    obraCta: localized(home.obraTeaser.cta),
    contactoTitulo: localized(home.contact.title),
    contactoBajada: localized(home.contact.lead),
    tiposDeTrabajo: localized(home.contact.workTypes),
  };

  const brandsDocument: SeedDocument = {
    _id: 'paginaMarcas',
    _type: 'paginaMarcas',
    ctaCabecera: localized(brands.headerCta),
    rubrosTitulo: localized(brands.sectorsTitle),
    rubros: withKeys(
      'rubro',
      brands.sectors.map((sector) => ({
        _type: 'rubro',
        titulo: localized(sector.title),
        descripcion: localized(sector.description),
        foto: reference(photoId(sector.photo)),
      })),
    ),
    masTrabajosTitulo: localized(brands.moreWorkTitle),
    antesDespuesTitulo: rich(brands.beforeAfter.title, 'marcas-antes-despues'),
    antesDespuesBajada: localized(brands.beforeAfter.lead),
    procesoTitulo: rich(brands.process.title, 'marcas-proceso'),
    pasos: infoItems('paso', brands.process.steps),
    paquetesTitulo: localized(brands.packagesTitle),
    paquetesCta: localized(brands.packagesCta),
  };

  const obraDocument: SeedDocument = {
    _id: 'paginaObra',
    _type: 'paginaObra',
    aperturaFoto: reference(photoId(obra.opening.photo)),
    aperturaSerieNumero: localized(obra.opening.seriesNumber),
    aperturaSerieTitulo: localized(obra.opening.seriesTitle),
    aperturaLeyenda: rich(obra.opening.caption, 'obra-apertura'),
    frase: localized(obra.quote),
    seriesTitulo: localized(obra.seriesTitle),
    sobreTitulo: rich(obra.aboutTitle, 'obra-sobre'),
    muestrasTitulo: localized(obra.exhibitionsTitle),
    copiasTitulo: rich(obra.printsTeaser.title, 'obra-copias'),
    copiasBajada: localized(obra.printsTeaser.lead),
    copiasCta: localized(obra.printsTeaser.cta),
    bandaTitulo: rich(obra.seriesPrintsBand.title, 'obra-banda'),
    bandaCta: localized(obra.seriesPrintsBand.cta),
  };

  const bookingOffers: SeedDocument[] = content.bookingOffers.map((offer) => ({
    _id: `sesion-${offer.slug}`,
    _type: 'sesionReservable',
    titulo: localized(offer.title),
    slug: { _type: 'slug', current: offer.slug },
    faceta: reference(`faceta-${offer.facet}`),
    descripcion: localized(offer.description),
    ...(offer.price === null ? {} : { precio: offer.price }),
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
    titulo: rich(prints.title, 'copias-titulo'),
    bajada: localized(prints.lead),
    cta: localized(prints.cta),
    etiquetaEdicion: localized(prints.editionLabel),
  };

  const siteTextsDocument: SeedDocument = { _id: 'textosDelSitio', _type: 'textosDelSitio' };

  return [
    settingsDocument,
    siteTextsDocument,
    homeDocument,
    brandsDocument,
    obraDocument,
    printsPageDocument,
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

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

const services = (items: ContentService[], prefix: string) =>
  withKeys(prefix, items.map((item) => ({ ...item })));

export const buildDocuments = (seed: SeedData, content: ContentData, assetIdOf: AssetIdOf): SeedDocument[] => {
  const { home, brands, obra, prints, settings } = content;
  const seriesSlug = (numero: string) => obra.seriesSlugs[numero] ?? numero;

  const photos: SeedDocument[] = seed.fotos.map((photo) => ({
    _id: photoId(photo.id),
    _type: 'foto',
    imagen: imageField(assetIdOf(photo.id)),
    alt: photo.alt,
    ...(photo.titulo !== undefined && { titulo: photo.titulo }),
    ...(photo.titulo_provisorio !== undefined && { tituloProvisorio: photo.titulo_provisorio }),
    ...(photo.lugar !== undefined && { lugar: photo.lugar }),
    ...(photo.anio != null && { anio: photo.anio }),
    facetas: photo.faceta === 'obra' ? [] : referenceList('faceta', [`faceta-${photo.faceta}`]),
    destacada: photo.destacada ?? false,
  }));

  const facets: SeedDocument[] = content.facets.map((facet) => ({
    _id: `faceta-${facet.slug}`,
    _type: 'faceta',
    nombre: facet.name,
    slug: { _type: 'slug', current: facet.slug },
    numero: facet.number,
    titulo: toPortableText(facet.title, `faceta-${facet.slug}-titulo`),
    lead: facet.lead,
    indexDescription: facet.indexDescription,
    ...(facet.quote !== undefined && { quote: toPortableText(facet.quote, `faceta-${facet.slug}-quote`) }),
    portada: referenceList('portada', photoIds(facet.cover)),
    galeria: referenceList('galeria', photoIds(facet.gallery)),
    servicios: services(facet.services, 'servicio').map((service) => ({ _type: 'servicio', ...service })),
    ctaTexto: facet.ctaText,
    ctaButton: facet.ctaButton,
  }));

  const packages: SeedDocument[] = seed.paquetesMarca.map((pack, index) => ({
    _id: `paquete-${slugify(pack.nombre)}`,
    _type: 'paqueteMarca',
    nombre: pack.nombre,
    precio: pack.precio,
    items: pack.items,
    destacado: pack.destacado ?? false,
    orden: index + 1,
  }));

  const beforeAfter: SeedDocument[] = brands.beforeAfter.pairs.map((pair, index) => ({
    _id: `antesDespues-${index + 1}`,
    _type: 'antesDespues',
    antes: imageField(assetIdOf(pair.before)),
    despues: imageField(assetIdOf(pair.after)),
    alt: pair.alt,
    provisorio: pair.provisional,
    orden: index + 1,
  }));

  const series: SeedDocument[] = seed.series.map((entry, index) => ({
    _id: `serie-${seriesSlug(entry.numero)}`,
    _type: 'serie',
    numero: entry.numero,
    orden: index + 1,
    titulo: entry.titulo,
    tituloVisible: toPortableText(obra.seriesDisplayTitles[entry.numero] ?? entry.titulo, `serie-${entry.numero}-titulo`),
    slug: { _type: 'slug', current: seriesSlug(entry.numero) },
    anios: entry.anios,
    lineaCuratorial: entry.lineaCuratorial,
    textoCuratorial: obra.seriesCuratorialTexts[entry.numero] ?? '',
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
    frase: seed.ajustes.frase,
    sobreMi: seed.ajustes.sobre_mi,
    retrato: imageField(assetIdOf(PORTRAIT_ID)),
    retratoAlt: settings.portraitAlt,
    statement: seed.ajustes.statement,
    muestras: withKeys('muestra', settings.exhibitions.map((show) => ({ _type: 'muestra', titulo: show.title, lugar: show.place, anio: show.year }))),
    infoCopias: withKeys('info', prints.info.map((item) => ({ _type: 'itemInfo', titulo: item.title, descripcion: item.description }))),
  };

  const homeDocument: SeedDocument = {
    _id: 'paginaInicio',
    _type: 'paginaInicio',
    bajada: home.lead,
    puertaEncargosFoto: reference(photoId(home.doors.encargos.photo)),
    puertaEncargosEtiqueta: home.doors.encargos.label,
    puertaEncargosTitulo: toPortableText(home.doors.encargos.title, 'home-puerta-encargos'),
    puertaEncargosSubtitulo: home.doors.encargos.subtitle,
    puertaObraFoto: reference(photoId(home.doors.obra.photo)),
    puertaObraEtiqueta: home.doors.obra.label,
    puertaObraTitulo: toPortableText(home.doors.obra.title, 'home-puerta-obra'),
    puertaObraSubtitulo: home.doors.obra.subtitle,
    ticker: home.ticker,
    sobreMiCta: home.about.cta,
    encargosEyebrow: home.encargos.eyebrow,
    encargosTitulo: toPortableText(home.encargos.title, 'home-encargos'),
    miniaturasEditorial: referenceList('editorial', photoIds(home.encargos.thumbnails.editorial)),
    miniaturasRetratos: referenceList('retratos', photoIds(home.encargos.thumbnails.retratos)),
    miniaturasMarcas: referenceList('marcas', photoIds(home.encargos.thumbnails.marcas)),
    miniaturasEventos: referenceList('eventos', photoIds(home.encargos.thumbnails.eventos)),
    tiraEditorial: referenceList('tira', photoIds(home.editorialStrip)),
    marcasEyebrow: home.brands.eyebrow,
    marcasTitulo: toPortableText(home.brands.title, 'home-marcas'),
    marcasServicios: services(home.brands.services, 'servicio').map((service) => ({ _type: 'servicio', ...service })),
    marcasCta: home.brands.cta,
    marcasGrilla: referenceList('grilla', photoIds(home.brands.grid)),
    obraTitulo: toPortableText(home.obraTeaser.title, 'home-obra'),
    obraBajada: home.obraTeaser.lead,
    obraFotos: referenceList('obra', photoIds(home.obraTeaser.photos)),
    obraCta: home.obraTeaser.cta,
    contactoTitulo: home.contact.title,
    contactoBajada: home.contact.lead,
    tiposDeTrabajo: home.contact.workTypes,
  };

  const brandsDocument: SeedDocument = {
    _id: 'paginaMarcas',
    _type: 'paginaMarcas',
    ctaCabecera: brands.headerCta,
    rubrosTitulo: brands.sectorsTitle,
    rubros: withKeys(
      'rubro',
      brands.sectors.map((sector) => ({
        _type: 'rubro',
        titulo: sector.title,
        descripcion: sector.description,
        foto: reference(photoId(sector.photo)),
      })),
    ),
    masTrabajosTitulo: brands.moreWorkTitle,
    antesDespuesTitulo: toPortableText(brands.beforeAfter.title, 'marcas-antes-despues'),
    antesDespuesBajada: brands.beforeAfter.lead,
    procesoTitulo: toPortableText(brands.process.title, 'marcas-proceso'),
    pasos: withKeys('paso', brands.process.steps.map((step) => ({ _type: 'itemInfo', titulo: step.title, descripcion: step.description }))),
    paquetesTitulo: brands.packagesTitle,
    paquetesCta: brands.packagesCta,
  };

  const obraDocument: SeedDocument = {
    _id: 'paginaObra',
    _type: 'paginaObra',
    aperturaFoto: reference(photoId(obra.opening.photo)),
    aperturaSerieNumero: obra.opening.seriesNumber,
    aperturaSerieTitulo: obra.opening.seriesTitle,
    aperturaLeyenda: toPortableText(obra.opening.caption, 'obra-apertura'),
    frase: obra.quote,
    seriesTitulo: obra.seriesTitle,
    sobreTitulo: toPortableText(obra.aboutTitle, 'obra-sobre'),
    muestrasTitulo: obra.exhibitionsTitle,
    copiasTitulo: toPortableText(obra.printsTeaser.title, 'obra-copias'),
    copiasBajada: obra.printsTeaser.lead,
    copiasCta: obra.printsTeaser.cta,
    bandaTitulo: toPortableText(obra.seriesPrintsBand.title, 'obra-banda'),
    bandaCta: obra.seriesPrintsBand.cta,
  };

  const bookingOffers: SeedDocument[] = content.bookingOffers.map((offer) => ({
    _id: `sesion-${offer.slug}`,
    _type: 'sesionReservable',
    titulo: offer.title,
    slug: { _type: 'slug', current: offer.slug },
    faceta: reference(`faceta-${offer.facet}`),
    descripcion: offer.description,
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
    titulo: toPortableText(prints.title, 'copias-titulo'),
    bajada: prints.lead,
    cta: prints.cta,
    etiquetaEdicion: prints.editionLabel,
  };

  return [
    settingsDocument,
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

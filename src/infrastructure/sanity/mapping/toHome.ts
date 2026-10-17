import type { HomeContent } from '@/domain/HomeContent';
import type { HomeDoor } from '@/domain/HomeDoor';
import type { Locale } from '@/domain/Locale';
import { pathTo } from '@/domain/routing/pathTo';
import type { SanityHomeDocument } from '../documents/SanityHomeDocument';
import type { SanityLocalized } from '../documents/SanityLocalized';
import type { SanityRichTitle } from '../documents/SanityRichTitle';
import { localizeList, localizeText } from './localize';
import { toPhoto, toPhotos } from './toPhoto';
import { toRichTitle } from './toRichTitle';
import { toService } from './toService';
import { translationsOf } from './translationsOf';

interface DoorParts {
  photo: SanityHomeDocument['puertaEncargosFoto'];
  label: SanityLocalized<string>;
  title: SanityLocalized<SanityRichTitle>;
  subtitle: SanityLocalized<string>;
  href: string;
}

const toDoor = (parts: DoorParts, locale: Locale): HomeDoor => ({
  photo: toPhoto(parts.photo, locale),
  label: localizeText(parts.label, locale),
  title: toRichTitle(parts.title, locale),
  subtitle: localizeText(parts.subtitle, locale),
  href: parts.href,
});

export const toHome = (document: SanityHomeDocument, locale: Locale): HomeContent => ({
  lead: localizeText(document.bajada, locale),
  encargosDoor: toDoor(
    {
      photo: document.puertaEncargosFoto,
      label: document.puertaEncargosEtiqueta,
      title: document.puertaEncargosTitulo,
      subtitle: document.puertaEncargosSubtitulo,
      href: pathTo(locale, { route: 'home', hash: 'encargos' }),
    },
    locale,
  ),
  obraDoor: toDoor(
    {
      photo: document.puertaObraFoto,
      label: document.puertaObraEtiqueta,
      title: document.puertaObraTitulo,
      subtitle: document.puertaObraSubtitulo,
      href: pathTo(locale, { route: 'obra' }),
    },
    locale,
  ),
  ticker: localizeList(document.ticker, locale),
  aboutCta: localizeText(document.sobreMiCta, locale),
  encargosEyebrow: localizeText(document.encargosEyebrow, locale),
  encargosTitle: toRichTitle(document.encargosTitulo, locale),
  facetThumbnails: {
    editorial: toPhotos(document.miniaturasEditorial, locale),
    retratos: toPhotos(document.miniaturasRetratos, locale),
    marcas: toPhotos(document.miniaturasMarcas, locale),
    eventos: toPhotos(document.miniaturasEventos, locale),
  },
  editorialStrip: toPhotos(document.tiraEditorial, locale),
  brandsEyebrow: localizeText(document.marcasEyebrow, locale),
  brandsTitle: toRichTitle(document.marcasTitulo, locale),
  brandServices: (document.marcasServicios ?? []).map((service) => toService(service, locale)),
  brandsCta: localizeText(document.marcasCta, locale),
  brandGrid: toPhotos(document.marcasGrilla, locale),
  obraTeaserTitle: toRichTitle(document.obraTitulo, locale),
  obraTeaserLead: localizeText(document.obraBajada, locale),
  obraTeaserPhotos: toPhotos(document.obraFotos, locale),
  obraTeaserCta: localizeText(document.obraCta, locale),
  contactTitle: localizeText(document.contactoTitulo, locale),
  contactLead: localizeText(document.contactoBajada, locale),
  workTypes: localizeList(document.tiposDeTrabajo, locale),
  translations: translationsOf(document.bajada, document.puertaEncargosTitulo),
});

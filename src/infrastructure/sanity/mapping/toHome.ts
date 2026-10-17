import type { HomeContent } from '@/domain/HomeContent';
import type { HomeDoor } from '@/domain/HomeDoor';
import type { RichTitle } from '@/domain/RichTitle';
import type { SanityHomeDocument } from '../documents/SanityHomeDocument';
import { toPhoto, toPhotos } from './toPhoto';
import { toRichTitle } from './toRichTitle';
import { toService } from './toService';

interface DoorParts {
  photo: SanityHomeDocument['puertaEncargosFoto'];
  label: string;
  title: RichTitle;
  subtitle: string;
  href: string;
}

const toDoor = (parts: DoorParts): HomeDoor => ({
  photo: toPhoto(parts.photo),
  label: parts.label,
  title: parts.title,
  subtitle: parts.subtitle,
  href: parts.href,
});

export const toHome = (document: SanityHomeDocument): HomeContent => ({
  lead: document.bajada,
  encargosDoor: toDoor({
    photo: document.puertaEncargosFoto,
    label: document.puertaEncargosEtiqueta,
    title: toRichTitle(document.puertaEncargosTitulo),
    subtitle: document.puertaEncargosSubtitulo,
    href: '/#encargos',
  }),
  obraDoor: toDoor({
    photo: document.puertaObraFoto,
    label: document.puertaObraEtiqueta,
    title: toRichTitle(document.puertaObraTitulo),
    subtitle: document.puertaObraSubtitulo,
    href: '/obra',
  }),
  ticker: document.ticker,
  aboutCta: document.sobreMiCta,
  encargosEyebrow: document.encargosEyebrow,
  encargosTitle: toRichTitle(document.encargosTitulo),
  facetThumbnails: {
    editorial: toPhotos(document.miniaturasEditorial),
    retratos: toPhotos(document.miniaturasRetratos),
    marcas: toPhotos(document.miniaturasMarcas),
    eventos: toPhotos(document.miniaturasEventos),
  },
  editorialStrip: toPhotos(document.tiraEditorial),
  brandsEyebrow: document.marcasEyebrow,
  brandsTitle: toRichTitle(document.marcasTitulo),
  brandServices: (document.marcasServicios ?? []).map(toService),
  brandsCta: document.marcasCta,
  brandGrid: toPhotos(document.marcasGrilla),
  obraTeaserTitle: toRichTitle(document.obraTitulo),
  obraTeaserLead: document.obraBajada,
  obraTeaserPhotos: toPhotos(document.obraFotos),
  obraTeaserCta: document.obraCta,
  contactTitle: document.contactoTitulo,
  contactLead: document.contactoBajada,
  workTypes: document.tiposDeTrabajo,
});

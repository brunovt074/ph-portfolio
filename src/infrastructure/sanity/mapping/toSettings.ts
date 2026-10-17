import type { SiteSettings } from '@/domain/SiteSettings';
import type { SanitySettingsDocument } from '../documents/SanitySettingsDocument';
import { toImagePhoto } from './toImagePhoto';
import { toInfoItem } from './toInfoItem';

export const toSettings = (document: SanitySettingsDocument): SiteSettings => ({
  email: document.email,
  whatsapp: document.whatsapp,
  instagram: document.instagram,
  quote: document.frase,
  about: document.sobreMi,
  portrait: toImagePhoto('retrato-lara', document.retratoAlt, 'retratos', document.retrato),
  artistStatement: document.statement,
  exhibitions: (document.muestras ?? []).map((show) => ({ title: show.titulo, place: show.lugar, year: show.anio })),
  printInfo: (document.infoCopias ?? []).map(toInfoItem),
});

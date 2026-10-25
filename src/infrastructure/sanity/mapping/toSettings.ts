import type { Locale } from '@/domain/Locale';
import type { SiteSettings } from '@/domain/SiteSettings';
import type { SanitySettingsDocument } from '../documents/SanitySettingsDocument';
import { localizeText } from './localize';
import { toImagePhoto } from './toImagePhoto';
import { toInfoItem } from './toInfoItem';

export const toSettings = (document: SanitySettingsDocument, locale: Locale): SiteSettings => ({
  email: document.email,
  whatsapp: document.whatsapp,
  instagram: document.instagram,
  quote: localizeText(document.frase, locale),
  about: localizeText(document.sobreMi, locale),
  portrait: toImagePhoto('retrato', localizeText(document.retratoAlt, locale), 'retratos', document.retrato),
  artistStatement: localizeText(document.statement, locale),
  exhibitions: (document.muestras ?? []).map((show) => ({ title: localizeText(show.titulo, locale), place: show.lugar, year: show.anio })),
  printInfo: (document.infoCopias ?? []).map((item) => toInfoItem(item, locale)),
});

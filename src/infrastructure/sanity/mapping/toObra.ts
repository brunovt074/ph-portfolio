import type { Locale } from '@/domain/Locale';
import type { ObraContent } from '@/domain/ObraContent';
import type { Print } from '@/domain/Print';
import type { SanityObraDocument } from '../documents/SanityObraDocument';
import { localizeText } from './localize';
import { toPhoto } from './toPhoto';
import { toRichTitle } from './toRichTitle';
import { translationsOf } from './translationsOf';

const TEASER_PHOTOS = 3;

export const toObra = (document: SanityObraDocument, prints: Print[], locale: Locale): ObraContent => ({
  opening: {
    photo: toPhoto(document.aperturaFoto, locale),
    seriesNumber: localizeText(document.aperturaSerieNumero, locale),
    seriesTitle: localizeText(document.aperturaSerieTitulo, locale),
    caption: toRichTitle(document.aperturaLeyenda, locale),
  },
  quote: localizeText(document.frase, locale),
  seriesTitle: localizeText(document.seriesTitulo, locale),
  aboutTitle: toRichTitle(document.sobreTitulo, locale),
  exhibitionsTitle: localizeText(document.muestrasTitulo, locale),
  printsTeaser: {
    title: toRichTitle(document.copiasTitulo, locale),
    lead: localizeText(document.copiasBajada, locale),
    cta: localizeText(document.copiasCta, locale),
    photos: prints
      .filter((print) => print.active)
      .slice(0, TEASER_PHOTOS)
      .map((print) => print.photo),
  },
  seriesPrintsBand: { title: toRichTitle(document.bandaTitulo, locale), cta: localizeText(document.bandaCta, locale) },
  translations: translationsOf(document.frase, document.sobreTitulo),
});

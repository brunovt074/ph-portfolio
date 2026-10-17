import type { ObraContent } from '@/domain/ObraContent';
import type { Print } from '@/domain/Print';
import type { SanityObraDocument } from '../documents/SanityObraDocument';
import { toPhoto } from './toPhoto';
import { toRichTitle } from './toRichTitle';

const TEASER_PHOTOS = 3;

export const toObra = (document: SanityObraDocument, prints: Print[]): ObraContent => ({
  opening: {
    photo: toPhoto(document.aperturaFoto),
    seriesNumber: document.aperturaSerieNumero,
    seriesTitle: document.aperturaSerieTitulo,
    caption: toRichTitle(document.aperturaLeyenda),
  },
  quote: document.frase,
  seriesTitle: document.seriesTitulo,
  aboutTitle: toRichTitle(document.sobreTitulo),
  exhibitionsTitle: document.muestrasTitulo,
  printsTeaser: {
    title: toRichTitle(document.copiasTitulo),
    lead: document.copiasBajada,
    cta: document.copiasCta,
    photos: prints
      .filter((print) => print.active)
      .slice(0, TEASER_PHOTOS)
      .map((print) => print.photo),
  },
  seriesPrintsBand: { title: toRichTitle(document.bandaTitulo), cta: document.bandaCta },
});

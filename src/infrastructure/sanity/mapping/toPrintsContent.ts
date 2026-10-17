import type { Locale } from '@/domain/Locale';
import type { PrintsContent } from '@/domain/PrintsContent';
import type { SanityPrintsPageDocument } from '../documents/SanityPrintsPageDocument';
import { localizeText } from './localize';
import { toInfoItem } from './toInfoItem';
import { toRichTitle } from './toRichTitle';
import { translationsOf } from './translationsOf';

export const toPrintsContent = (document: SanityPrintsPageDocument, locale: Locale): PrintsContent => ({
  title: toRichTitle(document.titulo, locale),
  lead: localizeText(document.bajada, locale),
  cta: localizeText(document.cta, locale),
  editionLabel: localizeText(document.etiquetaEdicion, locale),
  info: (document.info ?? []).map((item) => toInfoItem(item, locale)),
  translations: translationsOf(document.titulo, document.bajada),
});

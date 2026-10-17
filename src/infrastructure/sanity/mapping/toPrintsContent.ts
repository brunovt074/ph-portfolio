import type { PrintsContent } from '@/domain/PrintsContent';
import type { SanityPrintsPageDocument } from '../documents/SanityPrintsPageDocument';
import { toInfoItem } from './toInfoItem';
import { toRichTitle } from './toRichTitle';

export const toPrintsContent = (document: SanityPrintsPageDocument): PrintsContent => ({
  title: toRichTitle(document.titulo),
  lead: document.bajada,
  cta: document.cta,
  editionLabel: document.etiquetaEdicion,
  info: (document.info ?? []).map(toInfoItem),
});

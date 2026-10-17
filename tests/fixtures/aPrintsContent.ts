import type { PrintsContent } from '@/domain/PrintsContent';

export const aPrintsContent = (): PrintsContent => ({
  title: [{ text: 'Copias ', italic: false }, { text: 'de autor', italic: true }],
  lead: 'Ediciones limitadas.',
  cta: 'Consultar esta copia',
  editionLabel: 'Edición de {edicion} · quedan {disponibles}',
  info: [],
});

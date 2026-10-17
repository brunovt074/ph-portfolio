import type { SanitySiteTextsDocument } from '@/infrastructure/sanity/documents/SanitySiteTextsDocument';

export const aSanitySiteTexts = (overrides: SanitySiteTextsDocument = {}): SanitySiteTextsDocument => ({
  nav: { home: { es: 'Inicio' } },
  ...overrides,
});

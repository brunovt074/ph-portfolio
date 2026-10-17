import type { SanityRichTitle } from '@/infrastructure/sanity/documents/SanityRichTitle';

export const aSanityTitle = (...parts: [text: string, italic?: boolean][]): SanityRichTitle => [
  {
    _type: 'block',
    children: parts.map(([text, italic]) => ({ _type: 'span', text, marks: italic ? ['em'] : [] })),
  },
];

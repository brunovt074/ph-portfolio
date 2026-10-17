import type { RichTitle } from '@/domain/RichTitle';

export const parseRichTitle = (source: string): RichTitle =>
  source
    .split('*')
    .map((text, index) => ({ text, italic: index % 2 === 1 }))
    .filter((segment) => segment.text.length > 0);

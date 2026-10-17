import type { RichTitle } from '@/domain/RichTitle';
import type { SanityRichTitle } from '../documents/SanityRichTitle';

export const toRichTitle = (blocks: SanityRichTitle): RichTitle =>
  blocks
    .flatMap((block) => block.children)
    .map((child) => ({ text: child.text, italic: child.marks.includes('em') }))
    .filter((segment) => segment.text.length > 0);

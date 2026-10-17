import type { Locale } from '@/domain/Locale';
import type { RichTitle } from '@/domain/RichTitle';
import type { SanityLocalized } from '../documents/SanityLocalized';
import type { SanityRichTitle } from '../documents/SanityRichTitle';
import { localizeList } from './localize';

export const toRichTitle = (title: SanityLocalized<SanityRichTitle>, locale: Locale): RichTitle =>
  localizeList(title, locale)
    .flatMap((block) => block.children)
    .map((child) => ({ text: child.text, italic: child.marks.includes('em') }))
    .filter((segment) => segment.text.length > 0);

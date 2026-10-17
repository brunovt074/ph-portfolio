import { parseRichTitle } from '../../src/infrastructure/seed/parseRichTitle';

export const toPortableText = (marked: string, keyPrefix: string) => [
  {
    _type: 'block',
    _key: `${keyPrefix}-block`,
    style: 'normal',
    markDefs: [],
    children: parseRichTitle(marked).map((segment, index) => ({
      _type: 'span',
      _key: `${keyPrefix}-span-${index}`,
      text: segment.text,
      marks: segment.italic ? ['em'] : [],
    })),
  },
];

import { describe, expect, it } from 'vitest';
import { parseRichTitle } from '@/infrastructure/seed/parseRichTitle';

describe('parseRichTitle', () => {
  it('marks the starred word as italic', () => {
    expect(parseRichTitle('Imagen con *actitud*')).toEqual([
      { text: 'Imagen con ', italic: false },
      { text: 'actitud', italic: true },
    ]);
  });

  it('keeps a title without asterisks as a single plain segment', () => {
    expect(parseRichTitle('Encargos')).toEqual([{ text: 'Encargos', italic: false }]);
  });

  it('discards empty segments when the italic word opens the title', () => {
    expect(parseRichTitle('*Obra*')).toEqual([{ text: 'Obra', italic: true }]);
  });

  it('handles italic in the middle of the title', () => {
    expect(parseRichTitle('Ofi*cios* hoy')).toEqual([
      { text: 'Ofi', italic: false },
      { text: 'cios', italic: true },
      { text: ' hoy', italic: false },
    ]);
  });

  it('returns nothing for an empty string', () => {
    expect(parseRichTitle('')).toEqual([]);
  });
});

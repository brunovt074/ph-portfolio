import { describe, expect, it } from 'vitest';
import { formatText } from '@/domain/formatText';

describe('formatText', () => {
  it('fills the placeholders of a series eyebrow', () => {
    expect(formatText('Serie {number} · {count} fotografías', { number: 'II', count: 14 })).toBe('Serie II · 14 fotografías');
  });

  it('keeps a placeholder untouched when no value is given', () => {
    expect(formatText('Hola {name}', {})).toBe('Hola {name}');
  });
});

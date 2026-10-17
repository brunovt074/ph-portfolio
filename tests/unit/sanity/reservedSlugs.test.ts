import { describe, expect, it } from 'vitest';
import { seriesSlugProblem } from '../../../sanity/validation/reservedSlugs';

const reservedMessage = 'Esa dirección está reservada para la tienda de copias.';

describe('seriesSlugProblem', () => {
  it('rejects the Spanish prints store address for a Spanish series', () => {
    expect(seriesSlugProblem('copias', 'es')).toBe(reservedMessage);
  });

  it('rejects the English prints store address for an English series', () => {
    expect(seriesSlugProblem('prints', 'en')).toBe(reservedMessage);
  });

  it('rejects the Portuguese prints store address for a Portuguese series', () => {
    expect(seriesSlugProblem('copias', 'pt')).toBe(reservedMessage);
  });

  it('allows an address that is only reserved in another language', () => {
    expect(seriesSlugProblem('prints', 'es')).toBe(true);
  });

  it('allows a series without an address yet', () => {
    expect(seriesSlugProblem(undefined, 'en')).toBe(true);
  });
});

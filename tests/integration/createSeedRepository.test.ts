import { describe, expect, it } from 'vitest';
import { createSeedRepository } from '@/infrastructure/seed/createSeedRepository';

describe('createSeedRepository', () => {
  it('wires the handoff JSON files into a ready-to-use repository', async () => {
    const repository = createSeedRepository();

    const facets = await repository.getFacets();
    const settings = await repository.getSettings();

    expect(facets).toHaveLength(4);
    expect(settings.instagram).toContain('@sarahmoreau.ph');
  });
});

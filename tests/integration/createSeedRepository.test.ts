import { describe, expect, it } from 'vitest';
import { createSeedRepository } from '@/infrastructure/seed/createSeedRepository';

describe('createSeedRepository', () => {
  it('wires the handoff JSON files into a ready-to-use repository', async () => {
    const repository = createSeedRepository();

    const facets = await repository.getFacets('es');
    const settings = await repository.getSettings('es');

    expect(facets).toHaveLength(4);
    expect(settings.instagram).toContain('@sarahmoreau.foto');
  });

  it('marks seed content as Spanish only', async () => {
    expect((await createSeedRepository().getHome('en')).translations).toEqual({ es: true, en: false, pt: false });
  });
});

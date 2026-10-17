import { describe, expect, it } from 'vitest';
import { ListSeriesSlugs } from '@/application/ListSeriesSlugs';
import { FakeContentRepository } from '../fakes/FakeContentRepository';

describe('ListSeriesSlugs', () => {
  it('lists one static route per series so each one gets its own page', async () => {
    const slugs = await new ListSeriesSlugs(new FakeContentRepository()).execute();

    expect(slugs).toEqual(['oficios', 'geometrias', 'lo-que-queda', 'viajes-en-color']);
  });
});

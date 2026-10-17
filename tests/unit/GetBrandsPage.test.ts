import { describe, expect, it } from 'vitest';
import { GetBrandsPage } from '@/application/GetBrandsPage';
import { FacetNotFoundError } from '@/application/errors/FacetNotFoundError';
import { FakeContentRepository } from '../fakes/FakeContentRepository';

describe('GetBrandsPage', () => {
  it('offers the brand packages with navigation from Retratos to Eventos', async () => {
    const page = await new GetBrandsPage(new FakeContentRepository()).execute();

    expect(page.facet.slug).toBe('marcas');
    expect(page.brands.packagesTitle).toBe('Paquetes');
    expect(page.previous.href).toBe('/retratos');
    expect(page.next.href).toBe('/eventos');
    expect(page.settings.whatsapp).toBe('[NÚMERO]');
  });

  it('fails when the Marcas facet is missing from the content', async () => {
    const repository = new FakeContentRepository({ facets: [] });

    await expect(new GetBrandsPage(repository).execute()).rejects.toBeInstanceOf(FacetNotFoundError);
  });
});

import { describe, expect, it } from 'vitest';
import { GetBrandsPage } from '@/application/GetBrandsPage';
import { FacetNotFoundError } from '@/application/errors/FacetNotFoundError';
import { FakeContentRepository } from '../fakes/FakeContentRepository';
import { aFacet } from '../fixtures/aFacet';

describe('GetBrandsPage', () => {
  it('offers the brand packages with navigation from Retratos to Eventos', async () => {
    const page = await new GetBrandsPage(new FakeContentRepository()).execute('es');

    expect(page.facet.slug).toBe('marcas');
    expect(page.brands.packagesTitle).toBe('Paquetes');
    expect(page.previous.href).toBe('/retratos');
    expect(page.next.href).toBe('/eventos');
    expect(page.settings.whatsapp).toBe('[NÚMERO]');
  });

  it('labels the home link with the visitor language text when Marcas opens the facets', async () => {
    const repository = new FakeContentRepository({ facets: [aFacet('marcas', 3, 'Marcas')] });

    const page = await new GetBrandsPage(repository).execute('pt');

    expect(page.previous).toEqual({ label: 'Início', href: '/pt/' });
  });

  it('fails when the Marcas facet is missing from the content', async () => {
    const repository = new FakeContentRepository({ facets: [] });

    await expect(new GetBrandsPage(repository).execute('es')).rejects.toBeInstanceOf(FacetNotFoundError);
  });
});

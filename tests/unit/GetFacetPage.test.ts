import { describe, expect, it } from 'vitest';
import { GetFacetPage } from '@/application/GetFacetPage';
import { FacetNotFoundError } from '@/application/errors/FacetNotFoundError';
import { FakeContentRepository } from '../fakes/FakeContentRepository';

const useCase = () => new GetFacetPage(new FakeContentRepository());

describe('GetFacetPage', () => {
  it('lets a visitor of Editorial go back home and continue to Retratos', async () => {
    const page = await useCase().execute('es', 'editorial');

    expect(page.facet.name).toBe('Editorial & Moda');
    expect(page.previous).toEqual({ label: 'Inicio', href: '/' });
    expect(page.next).toEqual({ label: 'Retratos & Estudio', href: '/retratos' });
  });

  it('lets a visitor of Retratos go back to Editorial and continue to Marcas', async () => {
    const page = await useCase().execute('es', 'retratos');

    expect(page.previous).toEqual({ label: 'Editorial & Moda', href: '/editorial' });
    expect(page.next).toEqual({ label: 'Marcas', href: '/marcas' });
  });

  it('lets a visitor of Eventos go back to Marcas and continue to Obra', async () => {
    const page = await useCase().execute('es', 'eventos');

    expect(page.previous).toEqual({ label: 'Marcas', href: '/marcas' });
    expect(page.next).toEqual({ label: 'Obra', href: '/obra' });
    expect(page.settings.instagram).toHaveLength(1);
  });

  it('links neighbour facets inside the visitor language', async () => {
    const { previous, next } = await new GetFacetPage(new FakeContentRepository()).execute('en', 'retratos');

    expect(previous?.href).toBe('/en/editorial');
    expect(next?.href).toBe('/en/brands');
  });

  it('labels the Obra link with the visitor language text', async () => {
    const { next } = await new GetFacetPage(new FakeContentRepository()).execute('en', 'eventos');

    expect(next).toEqual({ label: 'Work', href: '/en/work' });
  });

  it('fails with FacetNotFoundError when the facet was removed from the content', async () => {
    const repository = new FakeContentRepository({ facets: [] });

    await expect(new GetFacetPage(repository).execute('es', 'editorial')).rejects.toBeInstanceOf(FacetNotFoundError);
    await expect(new GetFacetPage(repository).execute('es', 'editorial')).rejects.toThrow('Facet not found: editorial');
  });
});

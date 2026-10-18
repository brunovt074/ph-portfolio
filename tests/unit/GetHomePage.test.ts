import { describe, expect, it } from 'vitest';
import { GetHomePage } from '@/application/GetHomePage';
import { FakeContentRepository } from '../fakes/FakeContentRepository';

describe('GetHomePage', () => {
  it('gives the visitor the two doors, the four facets and the contact settings', async () => {
    const page = await new GetHomePage(new FakeContentRepository()).execute('es');

    expect(page.home.encargosDoor.href).toBe('/es/#encargos');
    expect(page.home.obraDoor.href).toBe('/es/obra');
    expect(page.facets.map((facet) => facet.slug)).toEqual(['editorial', 'retratos', 'marcas', 'eventos']);
    expect(page.settings.email).toBe('[EMAIL]');
  });
});

import { describe, expect, it } from 'vitest';
import { GetSeriesPage } from '@/application/GetSeriesPage';
import { SeriesNotFoundError } from '@/application/errors/SeriesNotFoundError';
import { FakeContentRepository } from '../fakes/FakeContentRepository';
import { aPrint } from '../fixtures/aPrint';

const repositoryWithPrints = () =>
  new FakeContentRepository({
    prints: [aPrint('copia-au01', 'oficios'), aPrint('copia-au03', 'geometrias'), aPrint('copia-au04', 'geometrias', false)],
  });

describe('GetSeriesPage', () => {
  it('opens the first series without a previous link and continues to the second', async () => {
    const page = await new GetSeriesPage(repositoryWithPrints()).execute('oficios');

    expect(page.series.title).toBe('Oficios');
    expect(page.previous).toBeNull();
    expect(page.next).toEqual({ label: 'II. Geometrías', href: '/obra/geometrias' });
    expect(page.obra.seriesTitle).toBe('Series');
  });

  it('opens a middle series with both neighbours', async () => {
    const page = await new GetSeriesPage(repositoryWithPrints()).execute('geometrias');

    expect(page.previous).toEqual({ label: 'I. Oficios', href: '/obra/oficios' });
    expect(page.next).toEqual({ label: 'III. Lo que queda', href: '/obra/lo-que-queda' });
  });

  it('opens the last series without a next link', async () => {
    const page = await new GetSeriesPage(repositoryWithPrints()).execute('viajes-en-color');

    expect(page.previous?.href).toBe('/obra/lo-que-queda');
    expect(page.next).toBeNull();
  });

  it('lists only the active prints of that series', async () => {
    const page = await new GetSeriesPage(repositoryWithPrints()).execute('geometrias');

    expect(page.prints.map((print) => print.id)).toEqual(['copia-au03']);
  });

  it('shows no prints for a series without active prints', async () => {
    const page = await new GetSeriesPage(repositoryWithPrints()).execute('lo-que-queda');

    expect(page.prints).toEqual([]);
  });

  it('fails with SeriesNotFoundError for an unknown slug', async () => {
    await expect(new GetSeriesPage(repositoryWithPrints()).execute('inexistente')).rejects.toBeInstanceOf(
      SeriesNotFoundError,
    );
    await expect(new GetSeriesPage(repositoryWithPrints()).execute('inexistente')).rejects.toThrow(
      'Series not found: inexistente',
    );
  });
});

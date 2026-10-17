import { describe, expect, it } from 'vitest';
import { GetSeriesPage } from '@/application/GetSeriesPage';
import { SeriesNotFoundError } from '@/application/errors/SeriesNotFoundError';
import { FakeContentRepository } from '../fakes/FakeContentRepository';
import { aPrint } from '../fixtures/aPrint';
import { aSeries } from '../fixtures/aSeries';

const repositoryWithPrints = () =>
  new FakeContentRepository({
    prints: [aPrint('copia-au01', 'oficios'), aPrint('copia-au03', 'geometrias'), aPrint('copia-au04', 'geometrias', false)],
  });

describe('GetSeriesPage', () => {
  it('opens the first series without a previous link and continues to the second', async () => {
    const page = await new GetSeriesPage(repositoryWithPrints()).execute('es', 'oficios');

    expect(page.series.title).toBe('Oficios');
    expect(page.previous).toBeNull();
    expect(page.next).toEqual({ label: 'II. Geometrías', href: '/obra/geometrias' });
    expect(page.obra.seriesTitle).toBe('Series');
  });

  it('opens a middle series with both neighbours', async () => {
    const page = await new GetSeriesPage(repositoryWithPrints()).execute('es', 'geometrias');

    expect(page.previous).toEqual({ label: 'I. Oficios', href: '/obra/oficios' });
    expect(page.next).toEqual({ label: 'III. Lo que queda', href: '/obra/lo-que-queda' });
  });

  it('opens the last series without a next link', async () => {
    const page = await new GetSeriesPage(repositoryWithPrints()).execute('es', 'viajes-en-color');

    expect(page.previous?.href).toBe('/obra/lo-que-queda');
    expect(page.next).toBeNull();
  });

  it('links neighbour series with the slug of the visitor language', async () => {
    const repository = new FakeContentRepository({
      series: [
        aSeries({ slug: 'trades', slugs: { es: 'oficios', en: 'trades', pt: 'oficios' } }),
        aSeries({ number: 'II', slug: 'shapes', slugs: { es: 'geometrias', en: 'shapes', pt: 'geometrias' } }),
      ],
    });

    const { next } = await new GetSeriesPage(repository).execute('en', 'trades');

    expect(next?.href).toBe('/en/work/shapes');
  });

  it('lists only the active prints of that series', async () => {
    const page = await new GetSeriesPage(repositoryWithPrints()).execute('es', 'geometrias');

    expect(page.prints.map((print) => print.id)).toEqual(['copia-au03']);
  });

  it('shows no prints for a series without active prints', async () => {
    const page = await new GetSeriesPage(repositoryWithPrints()).execute('es', 'lo-que-queda');

    expect(page.prints).toEqual([]);
  });

  it('fails with SeriesNotFoundError for an unknown slug', async () => {
    await expect(new GetSeriesPage(repositoryWithPrints()).execute('es', 'inexistente')).rejects.toBeInstanceOf(
      SeriesNotFoundError,
    );
    await expect(new GetSeriesPage(repositoryWithPrints()).execute('es', 'inexistente')).rejects.toThrow(
      'Series not found: inexistente',
    );
  });
});

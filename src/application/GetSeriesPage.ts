import type { ContentRepository } from '@/domain/ContentRepository';
import type { NavLink } from '@/domain/NavLink';
import type { Series } from '@/domain/Series';
import { SeriesNotFoundError } from './errors/SeriesNotFoundError';
import type { SeriesPageData } from './results/SeriesPageData';

const toLink = (series: Series): NavLink => ({ label: `${series.number}. ${series.title}`, href: `/obra/${series.slug}` });

export class GetSeriesPage {
  constructor(private readonly repository: ContentRepository) {}

  async execute(slug: string): Promise<SeriesPageData> {
    const [allSeries, allPrints, obra] = await Promise.all([
      this.repository.getSeries(),
      this.repository.getPrints(),
      this.repository.getObra(),
    ]);
    const index = allSeries.findIndex((candidate) => candidate.slug === slug);
    const series = allSeries[index];
    if (!series) {
      throw new SeriesNotFoundError(slug);
    }
    const previous = allSeries[index - 1];
    const next = allSeries[index + 1];
    return {
      series,
      previous: previous ? toLink(previous) : null,
      next: next ? toLink(next) : null,
      prints: allPrints.filter((print) => print.active && print.series.slug === slug),
      obra,
    };
  }
}

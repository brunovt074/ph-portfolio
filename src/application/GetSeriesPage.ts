import type { ContentRepository } from '@/domain/ContentRepository';
import type { Locale } from '@/domain/Locale';
import type { NavLink } from '@/domain/NavLink';
import type { Series } from '@/domain/Series';
import { pathTo } from '@/domain/routing/pathTo';
import { SeriesNotFoundError } from './errors/SeriesNotFoundError';
import type { SeriesPageData } from './results/SeriesPageData';

const toLink = (locale: Locale, series: Series): NavLink => ({
  label: `${series.number}. ${series.title}`,
  href: pathTo(locale, { route: 'serie', slug: series.slug }),
});

export class GetSeriesPage {
  constructor(private readonly repository: ContentRepository) {}

  async execute(locale: Locale, slug: string): Promise<SeriesPageData> {
    const [allSeries, allPrints, obra] = await Promise.all([
      this.repository.getSeries(locale),
      this.repository.getPrints(locale),
      this.repository.getObra(locale),
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
      previous: previous ? toLink(locale, previous) : null,
      next: next ? toLink(locale, next) : null,
      prints: allPrints.filter((print) => print.active && print.series.slug === slug),
      obra,
    };
  }
}

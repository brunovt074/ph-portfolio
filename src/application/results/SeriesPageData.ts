import type { NavLink } from '@/domain/NavLink';
import type { ObraContent } from '@/domain/ObraContent';
import type { Print } from '@/domain/Print';
import type { Series } from '@/domain/Series';

export interface SeriesPageData {
  series: Series;
  previous: NavLink | null;
  next: NavLink | null;
  prints: Print[];
  obra: ObraContent;
}

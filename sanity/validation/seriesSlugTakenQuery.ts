import type { Locale } from '../../src/domain/Locale';

export const seriesSlugTakenQuery = (locale: Locale): string =>
  `count(*[_type == "serie" && slug.${locale}.current == $slug && !(_id in [$id, "drafts." + $id])])`;

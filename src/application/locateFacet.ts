import type { Facet } from '@/domain/Facet';
import type { FacetSlug } from '@/domain/FacetSlug';
import type { Locale } from '@/domain/Locale';
import type { NavLink } from '@/domain/NavLink';
import { pathTo } from '@/domain/routing/pathTo';
import { FacetNotFoundError } from './errors/FacetNotFoundError';
import type { LocatedFacet } from './results/LocatedFacet';

export const locateFacet = (facets: Facet[], slug: FacetSlug, locale: Locale, homeLabel: string, obraLabel: string): LocatedFacet => {
  const index = facets.findIndex((candidate) => candidate.slug === slug);
  const facet = facets[index];
  if (!facet) {
    throw new FacetNotFoundError(slug);
  }
  const toLink = (target: Facet): NavLink => ({ label: target.name, href: pathTo(locale, { route: target.slug }) });
  const homeLink: NavLink = { label: homeLabel, href: pathTo(locale, { route: 'home' }) };
  const obraLink: NavLink = { label: obraLabel, href: pathTo(locale, { route: 'obra' }) };
  const previousFacet = facets[index - 1];
  const nextFacet = facets[index + 1];
  return {
    facet,
    previous: previousFacet ? toLink(previousFacet) : homeLink,
    next: nextFacet ? toLink(nextFacet) : obraLink,
  };
};

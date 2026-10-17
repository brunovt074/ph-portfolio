import type { Facet } from '@/domain/Facet';
import type { FacetSlug } from '@/domain/FacetSlug';
import type { NavLink } from '@/domain/NavLink';
import { FacetNotFoundError } from './errors/FacetNotFoundError';

export interface LocatedFacet {
  facet: Facet;
  previous: NavLink;
  next: NavLink;
}

const homeLink: NavLink = { label: 'Inicio', href: '/' };
const obraLink: NavLink = { label: 'Obra', href: '/obra' };

export const locateFacet = (facets: Facet[], slug: FacetSlug): LocatedFacet => {
  const index = facets.findIndex((candidate) => candidate.slug === slug);
  const facet = facets[index];
  if (!facet) {
    throw new FacetNotFoundError(slug);
  }
  const toLink = (target: Facet): NavLink => ({ label: target.name, href: `/${target.slug}` });
  const previousFacet = facets[index - 1];
  const nextFacet = facets[index + 1];
  return {
    facet,
    previous: previousFacet ? toLink(previousFacet) : homeLink,
    next: nextFacet ? toLink(nextFacet) : obraLink,
  };
};

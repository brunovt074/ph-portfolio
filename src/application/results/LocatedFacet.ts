import type { Facet } from '@/domain/Facet';
import type { NavLink } from '@/domain/NavLink';

export interface LocatedFacet {
  facet: Facet;
  previous: NavLink;
  next: NavLink;
}

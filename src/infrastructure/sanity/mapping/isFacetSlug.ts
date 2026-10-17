import type { FacetSlug } from '@/domain/FacetSlug';

const facetSlugs: ReadonlySet<string> = new Set<FacetSlug>(['editorial', 'retratos', 'marcas', 'eventos']);

export const isFacetSlug = (candidate: string): candidate is FacetSlug => facetSlugs.has(candidate);

import type { PhotoAsset } from './PhotoAsset';
import type { FacetSlug } from './FacetSlug';

export interface Photo { id: string; asset: PhotoAsset; alt: string; facet: FacetSlug | 'obra'; featured: boolean; title?: string; provisionalTitle?: boolean; place?: string; year?: number | null }

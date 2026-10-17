import type { Translations } from './Translations';
import type { FacetSlug } from './FacetSlug';
import type { RichTitle } from './RichTitle';
import type { Photo } from './Photo';
import type { Service } from './Service';

export interface Facet { slug: FacetSlug; number: number; name: string; title: RichTitle; lead: string; indexDescription: string; cover: Photo[]; gallery: Photo[]; services: Service[]; quote?: RichTitle; ctaText: string; ctaButton: string; translations: Translations }

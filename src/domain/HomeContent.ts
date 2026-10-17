import type { HomeDoor } from './HomeDoor';
import type { RichTitle } from './RichTitle';
import type { FacetSlug } from './FacetSlug';
import type { Photo } from './Photo';
import type { Service } from './Service';

export interface HomeContent { lead: string; encargosDoor: HomeDoor; obraDoor: HomeDoor; ticker: string[]; aboutCta: string; encargosEyebrow: string; encargosTitle: RichTitle; facetThumbnails: Record<FacetSlug, Photo[]>; editorialStrip: Photo[]; brandsEyebrow: string; brandsTitle: RichTitle; brandServices: Service[]; brandsCta: string; brandGrid: Photo[]; obraTeaserTitle: RichTitle; obraTeaserLead: string; obraTeaserPhotos: Photo[]; obraTeaserCta: string; contactTitle: string; contactLead: string; workTypes: string[] }

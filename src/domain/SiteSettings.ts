import type { Photo } from './Photo';
import type { Exhibition } from './Exhibition';
import type { InfoItem } from './InfoItem';

export interface SiteSettings { email: string; whatsapp: string; instagram: string[]; quote: string; about: string; portrait: Photo; artistStatement: string; exhibitions: Exhibition[]; printInfo: InfoItem[] }

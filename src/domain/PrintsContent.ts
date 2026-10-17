import type { Translations } from './Translations';
import type { RichTitle } from './RichTitle';
import type { InfoItem } from './InfoItem';

export interface PrintsContent { title: RichTitle; lead: string; cta: string; editionLabel: string; info: InfoItem[]; translations: Translations }

import type { Translations } from './Translations';
import type { BrandSector } from './BrandSector';
import type { RichTitle } from './RichTitle';
import type { BeforeAfterPair } from './BeforeAfterPair';
import type { ProcessStep } from './ProcessStep';
import type { BrandPackage } from './BrandPackage';

export interface BrandsContent { headerCta: string; sectorsTitle: string; sectors: BrandSector[]; moreWorkTitle: string; beforeAfterTitle: RichTitle; beforeAfterLead: string; beforeAfter: BeforeAfterPair[]; processTitle: RichTitle; steps: ProcessStep[]; packagesTitle: string; packagesCta: string; packages: BrandPackage[]; translations: Translations }

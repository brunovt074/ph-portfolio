import type { SanityLocalized } from './SanityLocalized';
import type { SanityPhotoDocument } from './SanityPhotoDocument';

export interface SanityBeforeAfterDocument {
  id: string;
  alt: SanityLocalized<string>;
  provisorio?: boolean | null;
  antes: SanityPhotoDocument['image'];
  despues: SanityPhotoDocument['image'];
}

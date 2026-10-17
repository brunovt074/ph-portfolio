import type { SanityPhotoDocument } from './SanityPhotoDocument';

export interface SanityBeforeAfterDocument {
  id: string;
  alt: string;
  provisorio?: boolean | null;
  antes: SanityPhotoDocument['image'];
  despues: SanityPhotoDocument['image'];
}

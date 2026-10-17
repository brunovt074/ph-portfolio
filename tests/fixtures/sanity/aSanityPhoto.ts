import type { SanityPhotoDocument } from '@/infrastructure/sanity/documents/SanityPhotoDocument';

export const aSanityPhoto = (overrides: Partial<SanityPhotoDocument> = {}): SanityPhotoDocument => ({
  id: 'foto-ed01',
  alt: 'Modelo de peluca roja con gorro de piel blanco',
  titulo: null,
  tituloProvisorio: null,
  lugar: null,
  anio: null,
  destacada: true,
  facets: ['editorial'],
  image: {
    hotspot: { x: 0.3, y: 0.7 },
    asset: { _id: 'image-a1b2c3-1600x2000-jpg', lqip: 'data:image/jpeg;base64,AAAA', width: 1600, height: 2000 },
  },
  ...overrides,
});

export const aBareSanityImage = (): SanityPhotoDocument['image'] => ({
  hotspot: null,
  asset: { _id: 'image-bare-800x600-jpg', lqip: null, width: null, height: null },
});

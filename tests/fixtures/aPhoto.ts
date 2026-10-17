import type { Photo } from '@/domain/Photo';

export const aPhoto = (overrides: Partial<Photo> = {}): Photo => ({
  id: 'ed01',
  asset: { provider: 'local', ref: 'ed01' },
  alt: 'Modelo con gorro de piel',
  facet: 'editorial',
  featured: false,
  ...overrides,
});

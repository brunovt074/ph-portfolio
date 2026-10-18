import type { SeedPhoto } from '../../src/infrastructure/seed/data/SeedPhoto';

export const reference = (documentId: string, key?: string) => ({
  _type: 'reference',
  _ref: documentId,
  ...(key !== undefined && { _key: key }),
});

export const referenceList = (prefix: string, documentIds: string[]) =>
  documentIds.map((documentId, index) => reference(documentId, `${prefix}-${index}`));

export const imageField = (assetId: string, hotspot?: SeedPhoto['hotspot']) => ({
  _type: 'image',
  asset: { _type: 'reference', _ref: assetId },
  ...(hotspot !== undefined && { hotspot: { _type: 'sanity.imageHotspot', ...hotspot } }),
});

export const withKeys = <T extends object>(prefix: string, items: T[]) =>
  items.map((item, index) => ({ _key: `${prefix}-${index}`, ...item }));


import { createClient } from '@sanity/client';
import type { ContentRepository } from '@/domain/ContentRepository';
import { CachedSanityClient } from './CachedSanityClient';
import { SanityContentRepository } from './SanityContentRepository';
import type { SanityConnection } from './SanityConnection';

export const SANITY_API_VERSION = '2026-10-17';

export const createSanityRepository = (connection: SanityConnection): ContentRepository => {
  const client = createClient({
    projectId: connection.projectId,
    dataset: connection.dataset,
    apiVersion: SANITY_API_VERSION,
    useCdn: true,
  });
  return new SanityContentRepository(new CachedSanityClient(client));
};

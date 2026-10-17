import type { ContentRepository } from '@/domain/ContentRepository';
import { createSanityRepository } from './sanity/createSanityRepository';
import { createSeedRepository } from './seed/createSeedRepository';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;

export const contentRepository: ContentRepository = projectId
  ? createSanityRepository({ projectId, dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production' })
  : createSeedRepository();

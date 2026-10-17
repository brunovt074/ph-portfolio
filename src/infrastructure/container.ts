import type { ContentRepository } from '@/domain/ContentRepository';
import { createSeedRepository } from './seed/createSeedRepository';

export const contentRepository: ContentRepository = createSeedRepository();

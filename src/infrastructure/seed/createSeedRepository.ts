import content from '../../../assets/content.json';
import seed from '../../../assets/seed.json';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { ContentData } from './ContentData';
import type { SeedData } from './SeedData';
import { SeedContentRepository } from './SeedContentRepository';

export const createSeedRepository = (): ContentRepository =>
  new SeedContentRepository(seed as SeedData, content as ContentData);

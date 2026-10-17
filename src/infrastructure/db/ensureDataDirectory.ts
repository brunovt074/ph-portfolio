import { mkdirSync } from 'node:fs';

export const ensureDataDirectory = (location: string): void => {
  if (!location.includes('://')) {
    mkdirSync(location, { recursive: true });
  }
};

import { join } from 'node:path';

export const migrationsFolder = (): string => join(process.cwd(), 'drizzle');

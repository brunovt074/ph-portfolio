import type { Database } from './Database';
import type { DatabaseConfig } from './DatabaseConfig';
import { ensureDataDirectory } from './ensureDataDirectory';
import { migrationsFolder } from './migrationsFolder';

const DEFAULT_PGLITE_DIR = './.data/pglite';

export const createDatabase = async ({ databaseUrl, pgliteDir }: DatabaseConfig): Promise<Database> => {
  if (databaseUrl) {
    const { default: postgres } = await import('postgres');
    const { drizzle } = await import('drizzle-orm/postgres-js');
    return drizzle(postgres(databaseUrl));
  }
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { migrate } = await import('drizzle-orm/pglite/migrator');
  const location = pgliteDir || DEFAULT_PGLITE_DIR;
  ensureDataDirectory(location);
  const database = drizzle(new PGlite(location));
  await migrate(database, { migrationsFolder: migrationsFolder() });
  return database as unknown as Database;
};

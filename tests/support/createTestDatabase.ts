import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import type { Database } from '@/infrastructure/db/Database';
import * as schema from '@/infrastructure/db/schema';

export const createTestDatabase = async (): Promise<{ db: Database; close: () => Promise<void> }> => {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: join(process.cwd(), 'drizzle') });
  return { db: db as unknown as Database, close: () => client.close() };
};

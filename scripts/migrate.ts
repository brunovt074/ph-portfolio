import { join } from 'node:path';
import { createDatabase } from '../src/infrastructure/db/createDatabase';

try {
  process.loadEnvFile(join(process.cwd(), '.env'));
} catch {
  console.log('No .env file found, using the process environment.');
}

const run = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const { default: postgres } = await import('postgres');
    const { drizzle } = await import('drizzle-orm/postgres-js');
    const { migrate } = await import('drizzle-orm/postgres-js/migrator');
    const client = postgres(databaseUrl, { max: 1 });
    await migrate(drizzle(client), { migrationsFolder: join(process.cwd(), 'drizzle') });
    await client.end();
    console.log('Migrations applied to DATABASE_URL.');
    return;
  }
  await createDatabase({ databaseUrl: undefined, pgliteDir: process.env.PGLITE_DIR });
  console.log('Migrations applied to the embedded PGlite database.');
  process.exit(0);
};

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

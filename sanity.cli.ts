import { defineCliConfig } from 'sanity/cli';

try {
  process.loadEnvFile('.env');
} catch {
  console.log('No .env file found, using the process environment.');
}

export default defineCliConfig({
  api: {
    projectId: process.env.PUBLIC_SANITY_PROJECT_ID ?? '',
    dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  },
});

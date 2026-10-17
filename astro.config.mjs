import react from '@astrojs/react';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

const env = { ...loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), ''), ...process.env };
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET || 'production';

const sanityIntegrations = projectId
  ? [sanity({ projectId, dataset, useCdn: false, studioBasePath: '/admin' })]
  : [];

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://laravischi.com',
  output: 'static',
  integrations: [react(), ...sanityIntegrations],
  prefetch: true,
  image: { responsiveStyles: false },
  vite: { plugins: [tailwindcss()] },
});

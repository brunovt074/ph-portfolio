import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';
import { loadEnv } from 'vite';

const env = { ...loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), ''), ...process.env };
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET || 'production';

const sanityIntegrations = projectId
  ? [sanity({ projectId, dataset, useCdn: false, studioBasePath: '/admin' })]
  : [];

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://sarahmoreau.example',
  output: 'static',
  adapter: node({ mode: 'standalone', bodySizeLimit: 1_048_576 }),
  integrations: [
    react(),
    sitemap({ filter: (page) => !/\/(admin|contacto|api)(\/|$)|\/reservas\/.+/.test(new URL(page).pathname) }),
    ...sanityIntegrations,
  ],
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      TRUST_PROXY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_DELIVERY_MODE: envField.string({ context: 'server', access: 'secret', optional: true }),
      DATABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      PGLITE_DIR: envField.string({ context: 'server', access: 'secret', optional: true }),
      PAYMENT_PROVIDER: envField.string({ context: 'server', access: 'secret', optional: true }),
      MERCADOPAGO_ACCESS_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      MERCADOPAGO_WEBHOOK_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      BOOKING_DEMO: envField.string({ context: 'server', access: 'secret', optional: true }),
      CALENDAR_PROVIDER: envField.string({ context: 'server', access: 'secret', optional: true }),
      GOOGLE_CALENDAR_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      GOOGLE_SERVICE_ACCOUNT_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      SITE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  build: { inlineStylesheets: 'always' },
  prefetch: true,
  image: { responsiveStyles: false },
  vite: { plugins: [tailwindcss()] },
});

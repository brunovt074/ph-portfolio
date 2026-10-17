import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://laravischi.com',
  output: 'static',
  integrations: [react()],
  prefetch: true,
  image: { responsiveStyles: false },
  vite: { plugins: [tailwindcss()] },
});

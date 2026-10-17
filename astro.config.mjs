import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://sarahmoreau.example',
  output: 'static',
  integrations: [react()],
  prefetch: true,
  image: { responsiveStyles: false },
  vite: { plugins: [tailwindcss()] },
});

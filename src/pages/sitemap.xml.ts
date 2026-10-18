import type { APIRoute } from 'astro';
import { ListSitemapEntries } from '@/application/ListSitemapEntries';
import { contentRepository } from '@/infrastructure/container';

export const GET: APIRoute = async ({ site }) => {
  const entries = await new ListSitemapEntries(contentRepository).execute();
  const urls = entries
    .map((entry) => {
      const alternates = Object.entries(entry.alternates)
        .map(([locale, path]) => `    <xhtml:link rel="alternate" hreflang="${locale}" href="${new URL(path ?? '/', site).href}" />`)
        .join('\n');
      return `  <url>\n    <loc>${new URL(entry.path, site).href}</loc>\n${alternates}\n  </url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

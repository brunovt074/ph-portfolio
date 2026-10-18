import type { APIRoute } from 'astro';
import { ListSitemapEntries } from '@/application/ListSitemapEntries';
import { contentRepository } from '@/infrastructure/container';

const escapeXml = (value: string): string =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const absolute = (path: string) => escapeXml(new URL(path, site).href);
  const entries = await new ListSitemapEntries(contentRepository).execute();
  const urls = entries.map((entry) => {
    const links = Object.entries(entry.alternates)
      .map(([hreflang, path]) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${absolute(path)}"/>`)
      .join('\n');
    return `  <url>\n    <loc>${absolute(entry.path)}</loc>\n${links}\n  </url>`;
  });
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

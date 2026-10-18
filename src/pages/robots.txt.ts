import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap.xml', site).href;
  return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /contacto/\nDisallow: /es/contacto/\nDisallow: /en/contacto/\nDisallow: /pt/contacto/\nDisallow: /reservas/\nDisallow: /api/\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

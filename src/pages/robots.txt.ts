import type { APIRoute } from 'astro';
import { BLOCK_INDEXING } from 'astro:env/server';
import { buildRobotsTxt } from '@/seo/buildRobotsTxt';

export const GET: APIRoute = ({ site }) =>
  new Response(buildRobotsTxt(new URL('/sitemap.xml', site).href, BLOCK_INDEXING === 'true'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });

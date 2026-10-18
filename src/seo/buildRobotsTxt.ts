const privatePaths = ['/admin', '/contacto/', '/es/contacto/', '/en/contacto/', '/pt/contacto/', '/reservas/', '/api/'];

export const buildRobotsTxt = (sitemapUrl: string, blockIndexing: boolean): string => {
  if (blockIndexing) {
    return 'User-agent: *\nDisallow: /\n';
  }
  const rules = privatePaths.map((path) => `Disallow: ${path}`).join('\n');
  return `User-agent: *\nAllow: /\n${rules}\n\nSitemap: ${sitemapUrl}\n`;
};

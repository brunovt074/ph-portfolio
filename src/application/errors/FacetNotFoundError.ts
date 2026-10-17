export class FacetNotFoundError extends Error {
  constructor(slug: string) {
    super(`Facet not found: ${slug}`);
    this.name = 'FacetNotFoundError';
  }
}

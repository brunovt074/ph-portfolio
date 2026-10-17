export class SeriesNotFoundError extends Error {
  constructor(slug: string) {
    super(`Series not found: ${slug}`);
    this.name = 'SeriesNotFoundError';
  }
}

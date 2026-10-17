export class MissingContentError extends Error {
  constructor(section: string, key: string) {
    super(`Missing content for ${section}: ${key}`);
    this.name = 'MissingContentError';
  }
}

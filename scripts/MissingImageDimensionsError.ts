export class MissingImageDimensionsError extends Error {
  constructor(file: string) {
    super(`Could not read image dimensions: ${file}`);
    this.name = 'MissingImageDimensionsError';
  }
}

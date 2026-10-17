export class UnknownPhotoError extends Error {
  constructor(id: string) {
    super(`Unknown photo id: ${id}`);
    this.name = 'UnknownPhotoError';
  }
}

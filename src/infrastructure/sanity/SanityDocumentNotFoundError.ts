export class SanityDocumentNotFoundError extends Error {
  constructor(documentId: string) {
    super(`Sanity document not found: ${documentId}. Create and publish it in the Studio or run "npm run seed".`);
    this.name = 'SanityDocumentNotFoundError';
  }
}

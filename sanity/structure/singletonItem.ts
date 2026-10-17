import type { StructureBuilder } from 'sanity/structure';

export const singletonItem = (S: StructureBuilder, documentId: string, title: string) =>
  S.listItem().title(title).id(documentId).child(S.document().schemaType(documentId).documentId(documentId).title(title));

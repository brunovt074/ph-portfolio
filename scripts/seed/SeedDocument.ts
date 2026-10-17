export interface SeedDocument {
  _id: string;
  _type: string;
  [field: string]: unknown;
}

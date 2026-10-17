export interface SanityBlock {
  _type: string;
  children: { _type: string; text: string; marks: string[] }[];
}

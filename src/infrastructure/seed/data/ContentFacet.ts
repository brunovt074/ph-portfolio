import type { ContentService } from './ContentService';

export interface ContentFacet {
  slug: 'editorial' | 'retratos' | 'marcas' | 'eventos';
  number: number;
  name: string;
  title: string;
  lead: string;
  indexDescription: string;
  cover: string[];
  gallery: string[];
  services: ContentService[];
  quote?: string;
  ctaText: string;
  ctaButton: string;
}

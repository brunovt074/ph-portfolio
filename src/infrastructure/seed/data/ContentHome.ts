import type { ContentDoor } from './ContentDoor';
import type { ContentService } from './ContentService';

export interface ContentHome {
  lead: string;
  doors: { encargos: ContentDoor; obra: ContentDoor };
  ticker: string[];
  about: { cta: string };
  encargos: {
    eyebrow: string;
    title: string;
    thumbnails: Record<'editorial' | 'retratos' | 'marcas' | 'eventos', string[]>;
  };
  editorialStrip: string[];
  brands: { eyebrow: string; title: string; services: ContentService[]; cta: string; grid: string[] };
  obraTeaser: { title: string; lead: string; photos: string[]; cta: string };
  contact: { title: string; lead: string; workTypes: string[] };
}

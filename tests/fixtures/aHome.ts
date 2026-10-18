import type { HomeContent } from '@/domain/HomeContent';
import type { HomeDoor } from '@/domain/HomeDoor';
import { aPhoto } from './aPhoto';

const aDoor = (href: string): HomeDoor => ({
  photo: aPhoto(),
  label: 'Puerta',
  title: [{ text: 'Encargos', italic: false }],
  subtitle: 'Subtítulo',
  href,
});

export const aHome = (): HomeContent => ({
  lead: 'Fotografía y video.',
  encargosDoor: aDoor('/es/#encargos'),
  obraDoor: aDoor('/es/obra'),
  ticker: ['Editorial'],
  aboutCta: 'Trabajemos juntos',
  encargosEyebrow: 'Encargos',
  encargosTitle: [{ text: 'Cuatro ', italic: false }, { text: 'miradas', italic: true }],
  facetThumbnails: { editorial: [], retratos: [], marcas: [], eventos: [] },
  editorialStrip: [],
  brandsEyebrow: 'Para marcas',
  brandsTitle: [],
  brandServices: [],
  brandsCta: 'Ver servicios',
  brandGrid: [],
  obraTeaserTitle: [],
  obraTeaserLead: '',
  obraTeaserPhotos: [],
  obraTeaserCta: '',
  contactTitle: 'Hablemos.',
  contactLead: '',
  workTypes: [],
  translations: { es: true, en: false, pt: false },
});

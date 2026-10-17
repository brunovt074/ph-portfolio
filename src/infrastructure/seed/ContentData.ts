export interface ContentService {
  title: string;
  description?: string;
  price?: string;
}

export interface ContentDoor {
  photo: string;
  label: string;
  title: string;
  subtitle: string;
}

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

export interface ContentBrands {
  headerCta: string;
  sectorsTitle: string;
  sectors: { title: string; description: string; photo: string }[];
  moreWorkTitle: string;
  beforeAfter: {
    title: string;
    lead: string;
    pairs: { before: string; after: string; alt: string; provisional: boolean }[];
  };
  process: { title: string; steps: { title: string; description: string }[] };
  packagesTitle: string;
  packagesCta: string;
}

export interface ContentObra {
  opening: { photo: string; seriesNumber: string; seriesTitle: string; caption: string };
  quote: string;
  seriesTitle: string;
  aboutTitle: string;
  exhibitionsTitle: string;
  printsTeaser: { title: string; lead: string; cta: string };
  seriesSlugs: Record<string, string>;
  seriesDisplayTitles: Record<string, string>;
  seriesCuratorialTexts: Record<string, string>;
  seriesPrintsBand: { title: string; cta: string };
}

export interface ContentPrints {
  title: string;
  lead: string;
  cta: string;
  editionLabel: string;
  info: { title: string; description: string }[];
}

export interface ContentSettings {
  exhibitions: { title: string; place: string; year: string }[];
  portraitAlt: string;
}

export interface ContentData {
  home: ContentHome;
  facets: ContentFacet[];
  brands: ContentBrands;
  obra: ContentObra;
  prints: ContentPrints;
  settings: ContentSettings;
}

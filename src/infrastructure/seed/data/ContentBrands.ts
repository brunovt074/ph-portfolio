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

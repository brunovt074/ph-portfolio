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

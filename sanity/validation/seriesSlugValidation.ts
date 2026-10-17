import type { CustomValidator } from 'sanity';
import { locales, type Locale } from '../../src/domain/Locale';
import { seriesSlugProblem } from './reservedSlugs';
import { seriesSlugTakenQuery } from './seriesSlugTakenQuery';

type SeriesSlugs = Partial<Record<Locale, { current?: string }>>;

const localeNames: Record<Locale, string> = { es: 'español', en: 'inglés', pt: 'portugués' };

export const seriesSlugValidation: CustomValidator<unknown> = async (value, context) => {
  const slugs = value as SeriesSlugs | undefined;
  if (!slugs?.es?.current) return 'Generá la dirección web en español.';
  const client = context.getClient({ apiVersion: '2026-10-17' });
  const id = (context.document?._id ?? '').replace(/^drafts\./, '');
  for (const locale of locales) {
    const current = slugs[locale]?.current;
    if (!current) continue;
    const reserved = seriesSlugProblem(current, locale);
    if (reserved !== true) return `${reserved} (${localeNames[locale]})`;
    const duplicates = await client.fetch<number>(seriesSlugTakenQuery(locale), { slug: current, id });
    if (duplicates > 0) return `Ya hay otra serie con la dirección "${current}" en ${localeNames[locale]}.`;
  }
  return true;
};

import { defineField, defineType } from 'sanity';
import { locales, type Locale } from '../../src/domain/Locale';
import type { SiteTextGroup } from '../../src/domain/SiteTexts';
import { defaultSiteTexts } from '../../src/infrastructure/texts/defaults/defaultSiteTexts';
import { siteTextLabels } from '../texts/siteTextLabels';

const localeTitles: Record<Locale, string> = { es: 'Español', en: 'Inglés', pt: 'Portugués' };

const groupNames = Object.keys(siteTextLabels) as SiteTextGroup[];

const textKeys = (group: SiteTextGroup) => Object.keys(siteTextLabels[group].fields);

const defaultText = (locale: Locale, group: SiteTextGroup, key: string): string =>
  (defaultSiteTexts[locale][group] as Record<string, string>)[key] ?? '';

const description = (group: SiteTextGroup, key: string): string => {
  const placeholder = /\{[^}]+\}/.exec(defaultText('es', group, key))?.[0];
  const base = 'Si lo dejás vacío se usa el texto de ejemplo.';
  return placeholder ? `${base} Mantené las palabras entre llaves, por ejemplo ${placeholder}.` : base;
};

const keyField = (group: SiteTextGroup, key: string) =>
  defineField({
    name: key,
    title: (siteTextLabels[group].fields as Record<string, string>)[key] ?? key,
    description: description(group, key),
    type: 'object',
    options: { collapsible: true, collapsed: true },
    fields: locales.map((locale) =>
      defineField({ name: locale, title: localeTitles[locale], type: 'string', placeholder: defaultText(locale, group, key) }),
    ),
  });

const groupField = (group: SiteTextGroup) =>
  defineField({
    name: group,
    title: siteTextLabels[group].title,
    type: 'object',
    group,
    options: { collapsible: false },
    fields: textKeys(group).map((key) => keyField(group, key)),
  });

export const textosDelSitio = defineType({
  name: 'textosDelSitio',
  title: 'Textos del sitio',
  type: 'document',
  groups: groupNames.map((group, index) => ({ name: group, title: siteTextLabels[group].title, default: index === 0 })),
  fields: groupNames.map(groupField),
  preview: { prepare: () => ({ title: 'Textos del sitio' }) },
});

import { defineArrayMember, defineField, defineType } from 'sanity';

const translationsFieldset = {
  name: 'traducciones',
  title: 'Inglés y portugués',
  options: { collapsible: true, collapsed: true },
};

const localizedFields = (build: (locale: 'es' | 'en' | 'pt', title: string) => ReturnType<typeof defineField>) => [
  build('es', 'Español'),
  { ...build('en', 'Inglés'), fieldset: translationsFieldset.name },
  { ...build('pt', 'Portugués'), fieldset: translationsFieldset.name },
];

export const textoLocalizado = defineType({
  name: 'textoLocalizado',
  title: 'Texto en tres idiomas',
  type: 'object',
  fieldsets: [translationsFieldset],
  fields: localizedFields((name, title) => defineField({ name, title, type: 'string' })),
});

export const parrafoLocalizado = defineType({
  name: 'parrafoLocalizado',
  title: 'Párrafo en tres idiomas',
  type: 'object',
  fieldsets: [translationsFieldset],
  fields: localizedFields((name, title) => defineField({ name, title, type: 'text', rows: 5 })),
});

export const tituloLocalizado = defineType({
  name: 'tituloLocalizado',
  title: 'Título con itálica en tres idiomas',
  type: 'object',
  fieldsets: [translationsFieldset],
  fields: localizedFields((name, title) => defineField({ name, title, type: 'tituloConItalica' })),
});

export const listaLocalizada = defineType({
  name: 'listaLocalizada',
  title: 'Lista en tres idiomas',
  type: 'object',
  fieldsets: [translationsFieldset],
  fields: localizedFields((name, title) =>
    defineField({ name, title, type: 'array', of: [defineArrayMember({ type: 'string' })] }),
  ),
});

export const slugLocalizado = defineType({
  name: 'slugLocalizado',
  title: 'Dirección web en tres idiomas',
  type: 'object',
  fieldsets: [translationsFieldset],
  fields: localizedFields((name, title) =>
    defineField({ name, title, type: 'slug', options: { source: `titulo.${name}` } }),
  ),
});

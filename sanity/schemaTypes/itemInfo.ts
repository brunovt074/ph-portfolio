import { defineField, defineType } from 'sanity';

export const itemInfo = defineType({
  name: 'itemInfo',
  title: 'Dato con título',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'descripcion', title: 'Descripción', type: 'text', rows: 3, validation: (rule) => rule.required() }),
  ],
  preview: { select: { title: 'titulo', subtitle: 'descripcion' } },
});

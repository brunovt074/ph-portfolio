import { defineField, defineType } from 'sanity';
import { requiredSpanish } from './campos';

export const itemInfo = defineType({
  name: 'itemInfo',
  title: 'Dato con título',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Título', type: 'textoLocalizado', validation: (rule) => requiredSpanish(rule) }),
    defineField({ name: 'descripcion', title: 'Descripción', type: 'parrafoLocalizado', validation: (rule) => requiredSpanish(rule) }),
  ],
  preview: { select: { title: 'titulo.es', subtitle: 'descripcion.es' } },
});

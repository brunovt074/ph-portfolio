import { defineField, defineType } from 'sanity';
import { requiredSpanish } from './campos';

export const servicio = defineType({
  name: 'servicio',
  title: 'Servicio',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Nombre del servicio', type: 'textoLocalizado', validation: (rule) => requiredSpanish(rule) }),
    defineField({ name: 'descripcion', title: 'Descripción', type: 'parrafoLocalizado' }),
    defineField({
      name: 'precio',
      title: 'Precio',
      type: 'textoLocalizado',
      description: 'Texto libre. Ejemplos: "$ 120.000", "desde $ 80.000 / mes". Dejalo vacío si no querés mostrar precio.',
    }),
  ],
  preview: { select: { title: 'titulo.es', subtitle: 'precio.es' } },
});

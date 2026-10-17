import { defineField, defineType } from 'sanity';
import { requiredSpanish } from './campos';

export const paqueteMarca = defineType({
  name: 'paqueteMarca',
  title: 'Paquete para marcas',
  type: 'document',
  fields: [
    defineField({ name: 'nombre', title: 'Nombre', type: 'textoLocalizado', validation: (rule) => requiredSpanish(rule) }),
    defineField({
      name: 'precio',
      title: 'Precio',
      type: 'textoLocalizado',
      description: 'Texto libre. Ejemplos: "$ 150.000", "desde $ 90.000", "$ 60.000 / mes".',
      validation: (rule) => requiredSpanish(rule),
    }),
    defineField({
      name: 'items',
      title: 'Qué incluye',
      type: 'listaLocalizada',
      validation: (rule) => requiredSpanish(rule),
    }),
    defineField({ name: 'destacado', title: 'Paquete destacado', type: 'boolean', description: 'Se resalta en la página como el recomendado.', initialValue: false }),
    defineField({ name: 'orden', title: 'Orden', type: 'number', description: 'Número chico va primero (1, 2, 3).', validation: (rule) => rule.required().integer() }),
  ],
  orderings: [{ title: 'Por orden', name: 'orden', by: [{ field: 'orden', direction: 'asc' }] }],
  preview: { select: { title: 'nombre.es', subtitle: 'precio.es' } },
});

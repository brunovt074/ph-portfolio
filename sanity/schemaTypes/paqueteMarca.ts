import { defineArrayMember, defineField, defineType } from 'sanity';

export const paqueteMarca = defineType({
  name: 'paqueteMarca',
  title: 'Paquete para marcas',
  type: 'document',
  fields: [
    defineField({ name: 'nombre', title: 'Nombre', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'precio',
      title: 'Precio',
      type: 'string',
      description: 'Texto libre. Ejemplos: "$ 150.000", "desde $ 90.000", "$ 60.000 / mes".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Qué incluye',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({ name: 'destacado', title: 'Paquete destacado', type: 'boolean', description: 'Se resalta en la página como el recomendado.', initialValue: false }),
    defineField({ name: 'orden', title: 'Orden', type: 'number', description: 'Número chico va primero (1, 2, 3).', validation: (rule) => rule.required().integer() }),
  ],
  orderings: [{ title: 'Por orden', name: 'orden', by: [{ field: 'orden', direction: 'asc' }] }],
  preview: { select: { title: 'nombre', subtitle: 'precio' } },
});

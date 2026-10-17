import { defineField, defineType } from 'sanity';

const imageField = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    description,
    type: 'image',
    options: { hotspot: true, metadata: ['lqip'] },
    validation: (rule) => rule.required(),
  });

export const antesDespues = defineType({
  name: 'antesDespues',
  title: 'Antes y después',
  type: 'document',
  fields: [
    imageField('antes', 'Foto original (antes)', 'La toma sin retocar.'),
    imageField('despues', 'Foto final (después)', 'La imagen retocada. Tiene que tener las mismas proporciones que la original.'),
    defineField({
      name: 'alt',
      title: 'Descripción',
      type: 'string',
      description: 'Qué se ve y qué cambió con el retoque.',
      validation: (rule) => rule.required().min(10).max(160),
    }),
    defineField({ name: 'provisorio', title: 'Es un ejemplo provisorio', type: 'boolean', initialValue: false }),
    defineField({ name: 'orden', title: 'Orden', type: 'number', validation: (rule) => rule.required().integer() }),
  ],
  orderings: [{ title: 'Por orden', name: 'orden', by: [{ field: 'orden', direction: 'asc' }] }],
  preview: { select: { title: 'alt', media: 'despues' } },
});

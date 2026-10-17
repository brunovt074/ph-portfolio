import { defineArrayMember, defineField, defineType } from 'sanity';

export const copia = defineType({
  name: 'copia',
  title: 'Copia de autor',
  type: 'document',
  fields: [
    defineField({ name: 'foto', title: 'Foto', type: 'reference', to: [{ type: 'foto' }], validation: (rule) => rule.required() }),
    defineField({ name: 'serie', title: 'Serie', type: 'reference', to: [{ type: 'serie' }], validation: (rule) => rule.required() }),
    defineField({ name: 'orden', title: 'Orden', type: 'number', description: 'Número chico va primero.', validation: (rule) => rule.required().integer() }),
    defineField({ name: 'edicion', title: 'Tamaño de la edición', type: 'number', description: 'Cuántas copias existen en total. Ejemplo: 10.', validation: (rule) => rule.required().integer().min(1) }),
    defineField({
      name: 'disponibles',
      title: 'Copias disponibles',
      type: 'number',
      description: 'Cuántas quedan a la venta. Dejalo vacío si todavía no lo definiste. No puede ser más que la edición.',
      validation: (rule) =>
        rule
          .integer()
          .min(0)
          .custom((value, context) => {
            const edicion = (context.document as { edicion?: number } | undefined)?.edicion;
            return value !== undefined && edicion !== undefined && value > edicion
              ? 'No puede haber más copias disponibles que el tamaño de la edición.'
              : true;
          }),
    }),
    defineField({
      name: 'tamanos',
      title: 'Tamaños y precios',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tamano',
          fields: [
            defineField({ name: 'medida', title: 'Medida', type: 'string', description: 'Ejemplo: "30 × 40 cm".', validation: (rule) => rule.required() }),
            defineField({ name: 'precio', title: 'Precio', type: 'string', description: 'Texto libre. Ejemplo: "$ 95.000".', validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: 'medida', subtitle: 'precio' } },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({ name: 'activa', title: 'Publicada en la tienda', type: 'boolean', description: 'Apagala para ocultar la copia sin borrarla.', initialValue: true }),
  ],
  orderings: [{ title: 'Por orden', name: 'orden', by: [{ field: 'orden', direction: 'asc' }] }],
  preview: {
    select: { title: 'foto.titulo', alt: 'foto.alt', media: 'foto.imagen', activa: 'activa' },
    prepare: ({ title, alt, media, activa }) => ({
      title: title ?? alt,
      subtitle: activa ? 'Publicada' : 'Oculta',
      media,
    }),
  },
});

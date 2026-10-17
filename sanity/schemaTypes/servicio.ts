import { defineField, defineType } from 'sanity';

export const servicio = defineType({
  name: 'servicio',
  title: 'Servicio',
  type: 'object',
  fields: [
    defineField({ name: 'titulo', title: 'Nombre del servicio', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'descripcion', title: 'Descripción', type: 'text', rows: 3 }),
    defineField({
      name: 'precio',
      title: 'Precio',
      type: 'string',
      description: 'Texto libre. Ejemplos: "$ 120.000", "desde $ 80.000 / mes". Dejalo vacío si no querés mostrar precio.',
    }),
  ],
  preview: { select: { title: 'titulo', subtitle: 'precio' } },
});

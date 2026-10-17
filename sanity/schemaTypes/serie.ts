import { defineArrayMember, defineField, defineType } from 'sanity';

const layoutOptions = [
  { title: 'Centrada', value: 'centro' },
  { title: 'A la izquierda', value: 'izquierda' },
  { title: 'A la derecha', value: 'derecha' },
  { title: 'En par (junto a la siguiente)', value: 'par' },
  { title: 'A pantalla completa', value: 'sangre' },
];

export const serie = defineType({
  name: 'serie',
  title: 'Serie',
  type: 'document',
  fields: [
    defineField({ name: 'numero', title: 'Número romano', type: 'string', description: 'I, II, III, IV...', validation: (rule) => rule.required() }),
    defineField({ name: 'orden', title: 'Orden', type: 'number', description: '1, 2, 3... Define el orden en el índice.', validation: (rule) => rule.required().integer() }),
    defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'tituloVisible',
      title: 'Título con itálica',
      type: 'tituloConItalica',
      description: 'El mismo título, pero con la parte que querés destacar en itálica.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Dirección web',
      type: 'slug',
      description: 'Se genera sola a partir del título. No la cambies una vez publicada la serie.',
      options: { source: 'titulo' },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'anios', title: 'Años', type: 'string', description: 'Ejemplo: "2022–2024".', validation: (rule) => rule.required() }),
    defineField({ name: 'lineaCuratorial', title: 'Línea curatorial', type: 'string', description: 'Una sola línea para el índice de series.', validation: (rule) => rule.required() }),
    defineField({ name: 'textoCuratorial', title: 'Texto curatorial', type: 'text', rows: 6, description: 'El texto largo de la página de la serie.', validation: (rule) => rule.required() }),
    defineField({
      name: 'fotos',
      title: 'Fotos de la serie',
      type: 'array',
      description: 'Arrastrá para cambiar el orden. En cada foto elegí cómo se muestra.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'fotoDeSerie',
          title: 'Foto de la serie',
          fields: [
            defineField({ name: 'foto', title: 'Foto', type: 'reference', to: [{ type: 'foto' }], validation: (rule) => rule.required() }),
            defineField({
              name: 'layout',
              title: 'Cómo se muestra',
              type: 'string',
              options: { list: layoutOptions, layout: 'radio' },
              initialValue: 'centro',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'foto.titulo', alt: 'foto.alt', media: 'foto.imagen', layout: 'layout' },
            prepare: ({ title, alt, media, layout }) => ({
              title: title ?? alt,
              subtitle: layoutOptions.find((option) => option.value === layout)?.title ?? '',
              media,
            }),
          },
        }),
      ],
    }),
  ],
  orderings: [{ title: 'Por orden', name: 'orden', by: [{ field: 'orden', direction: 'asc' }] }],
  preview: { select: { title: 'titulo', subtitle: 'numero', media: 'fotos.0.foto.imagen' } },
});

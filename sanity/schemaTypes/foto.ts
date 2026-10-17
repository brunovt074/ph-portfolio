import { defineArrayMember, defineField, defineType } from 'sanity';

export const foto = defineType({
  name: 'foto',
  title: 'Foto',
  type: 'document',
  fields: [
    defineField({
      name: 'imagen',
      title: 'Imagen',
      type: 'image',
      description: 'Subí la foto en la mejor calidad que tengas. Con "Recorte y punto focal" marcás qué parte no se tiene que cortar.',
      options: { hotspot: true, metadata: ['lqip', 'palette'] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Descripción de la foto',
      type: 'string',
      description: 'Una frase que describa lo que se ve (para personas que no pueden ver la imagen y para Google). Entre 10 y 160 letras.',
      validation: (rule) => rule.required().min(10).max(160),
    }),
    defineField({
      name: 'titulo',
      title: 'Título',
      type: 'string',
      description: 'Opcional. Es obligatorio si la foto va en una serie de Obra.',
    }),
    defineField({
      name: 'tituloProvisorio',
      title: 'El título es provisorio',
      type: 'boolean',
      description: 'Activalo si todavía no es el título definitivo.',
      initialValue: false,
    }),
    defineField({ name: 'lugar', title: 'Lugar', type: 'string', description: 'Ciudad o sitio donde se tomó. Aparece en el pie de foto de las series.' }),
    defineField({ name: 'anio', title: 'Año', type: 'number', validation: (rule) => rule.integer().min(1900).max(2100) }),
    defineField({
      name: 'facetas',
      title: 'Facetas',
      type: 'array',
      description: 'Dónde aparece esta foto: Editorial, Retratos, Marcas o Eventos. Una foto puede estar en varias. Las fotos de Obra se dejan sin faceta.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'faceta' }] })],
    }),
    defineField({
      name: 'destacada',
      title: 'Destacada',
      type: 'boolean',
      description: 'Marcala si es una candidata a portada del sitio.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'titulo', alt: 'alt', media: 'imagen', lugar: 'lugar', anio: 'anio' },
    prepare: ({ title, alt, media, lugar, anio }) => ({
      title: title ?? alt,
      subtitle: [lugar, anio].filter(Boolean).join(' · '),
      media,
    }),
  },
});

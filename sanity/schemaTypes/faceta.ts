import { defineArrayMember, defineField, defineType } from 'sanity';
import { fotoReferencias } from './fotoReferencias';

export const faceta = defineType({
  name: 'faceta',
  title: 'Faceta',
  type: 'document',
  fields: [
    defineField({ name: 'nombre', title: 'Nombre', type: 'string', description: 'Ejemplo: "Editorial & Moda".', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      title: 'Dirección web',
      type: 'slug',
      description: 'Es la parte final de la dirección. Tiene que ser una de: editorial, retratos, marcas, eventos. No la cambies.',
      options: { source: 'nombre' },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'numero', title: 'Número de orden', type: 'number', description: '1, 2, 3 o 4. Define el orden en el sitio.', validation: (rule) => rule.required().integer().min(1) }),
    defineField({
      name: 'titulo',
      title: 'Título de la página',
      type: 'tituloConItalica',
      description: 'Seleccioná una palabra y tocá "Itálica" para destacarla.',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'lead', title: 'Bajada de la página', type: 'text', rows: 3, description: 'El texto que acompaña al título.', validation: (rule) => rule.required() }),
    defineField({ name: 'indexDescription', title: 'Descripción corta para la portada del sitio', type: 'string', description: 'Una línea que aparece en la lista de la home.', validation: (rule) => rule.required() }),
    defineField({ name: 'quote', title: 'Frase destacada', type: 'tituloConItalica', description: 'Opcional. Una cita que aparece entre las fotos.' }),
    fotoReferencias({ name: 'portada', title: 'Fotos de portada', description: 'Las fotos grandes del comienzo de la página (2 o 3).', min: 1, max: 3 }),
    fotoReferencias({ name: 'galeria', title: 'Galería', description: 'Arrastrá las fotos para cambiar el orden.' }),
    defineField({ name: 'servicios', title: 'Servicios', type: 'array', of: [defineArrayMember({ type: 'servicio' })] }),
    defineField({ name: 'ctaTexto', title: 'Texto de la invitación final', type: 'string', description: 'Ejemplo: "¿Tenés una producción en mente?".', validation: (rule) => rule.required() }),
    defineField({ name: 'ctaButton', title: 'Texto del botón final', type: 'string', description: 'Ejemplo: "Contame tu idea".', validation: (rule) => rule.required() }),
  ],
  orderings: [{ title: 'Por número', name: 'numero', by: [{ field: 'numero', direction: 'asc' }] }],
  preview: { select: { title: 'nombre', subtitle: 'numero' } },
});

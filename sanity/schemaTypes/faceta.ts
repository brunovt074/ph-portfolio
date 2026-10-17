import { defineArrayMember, defineField, defineType } from 'sanity';
import { requiredSpanish } from './campos';
import { fotoReferencias } from './fotoReferencias';

export const faceta = defineType({
  name: 'faceta',
  title: 'Faceta',
  type: 'document',
  fields: [
    defineField({ name: 'nombre', title: 'Nombre', type: 'textoLocalizado', description: 'Ejemplo: "Editorial & Moda".', validation: (rule) => requiredSpanish(rule) }),
    defineField({
      name: 'slug',
      title: 'Dirección web',
      type: 'slug',
      description: 'Es la parte final de la dirección. Tiene que ser una de: editorial, retratos, marcas, eventos. No la cambies.',
      options: { source: 'nombre.es' },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'numero', title: 'Número de orden', type: 'number', description: '1, 2, 3 o 4. Define el orden en el sitio.', validation: (rule) => rule.required().integer().min(1) }),
    defineField({
      name: 'titulo',
      title: 'Título de la página',
      type: 'tituloLocalizado',
      description: 'Seleccioná una palabra y tocá "Itálica" para destacarla.',
      validation: (rule) => requiredSpanish(rule),
    }),
    defineField({ name: 'lead', title: 'Bajada de la página', type: 'parrafoLocalizado', description: 'El texto que acompaña al título.', validation: (rule) => requiredSpanish(rule) }),
    defineField({ name: 'indexDescription', title: 'Descripción corta para la portada del sitio', type: 'textoLocalizado', description: 'Una línea que aparece en la lista de la home.', validation: (rule) => requiredSpanish(rule) }),
    defineField({ name: 'quote', title: 'Frase destacada', type: 'tituloLocalizado', description: 'Opcional. Una cita que aparece entre las fotos.' }),
    fotoReferencias({ name: 'portada', title: 'Fotos de portada', description: 'Las fotos grandes del comienzo de la página (2 o 3).', min: 1, max: 3 }),
    fotoReferencias({ name: 'galeria', title: 'Galería', description: 'Arrastrá las fotos para cambiar el orden.' }),
    defineField({ name: 'servicios', title: 'Servicios', type: 'array', of: [defineArrayMember({ type: 'servicio' })] }),
    defineField({ name: 'ctaTexto', title: 'Texto de la invitación final', type: 'textoLocalizado', description: 'Ejemplo: "¿Tenés una producción en mente?".', validation: (rule) => requiredSpanish(rule) }),
    defineField({ name: 'ctaButton', title: 'Texto del botón final', type: 'textoLocalizado', description: 'Ejemplo: "Contame tu idea".', validation: (rule) => requiredSpanish(rule) }),
  ],
  orderings: [{ title: 'Por número', name: 'numero', by: [{ field: 'numero', direction: 'asc' }] }],
  preview: { select: { title: 'nombre.es', subtitle: 'numero' } },
});

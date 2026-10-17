import { defineField, defineType } from 'sanity';
import { campoParrafo, campoTexto } from './campos';

export const sesionReservable = defineType({
  name: 'sesionReservable',
  title: 'Sesión reservable',
  type: 'document',
  fields: [
    campoTexto('titulo', 'Título'),
    defineField({
      name: 'slug',
      title: 'Dirección web',
      type: 'slug',
      options: { source: 'titulo.es' },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'faceta', title: 'Faceta', type: 'reference', to: [{ type: 'faceta' }], validation: (rule) => rule.required() }),
    campoParrafo('descripcion', 'Descripción'),
    defineField({
      name: 'precio',
      title: 'Precio',
      type: 'number',
      description: 'Precio total en pesos. Dejalo vacío para que la sesión se muestre sin precio y sin reserva online.',
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'duracionMinutos',
      title: 'Duración (minutos)',
      type: 'number',
      description: 'Duración de la sesión. Si está vacía, la clienta propone una fecha en lugar de elegir un turno.',
      validation: (rule) => rule.integer().min(15).max(600),
    }),
    defineField({
      name: 'porcentajeSena',
      title: 'Porcentaje de seña',
      type: 'number',
      initialValue: 50,
      validation: (rule) => rule.required().min(10).max(100),
    }),
    defineField({ name: 'activa', title: 'Activa', type: 'boolean', initialValue: true }),
    defineField({ name: 'orden', title: 'Orden', type: 'number', description: 'Número chico va primero (1, 2, 3).', validation: (rule) => rule.required().integer() }),
  ],
  orderings: [{ title: 'Por orden', name: 'orden', by: [{ field: 'orden', direction: 'asc' }] }],
  preview: { select: { title: 'titulo', subtitle: 'precio' } },
});

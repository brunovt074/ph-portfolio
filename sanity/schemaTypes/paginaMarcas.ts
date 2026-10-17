import { defineArrayMember, defineField, defineType } from 'sanity';
import { campoParrafo, campoTexto, campoTitulo } from './campos';
import { fotoUnica } from './fotoUnica';

export const paginaMarcas = defineType({
  name: 'paginaMarcas',
  title: 'Página de Marcas',
  type: 'document',
  fields: [
    campoTexto('ctaCabecera', 'Botón de la cabecera'),
    campoTexto('rubrosTitulo', 'Título de los rubros'),
    defineField({
      name: 'rubros',
      title: 'Rubros',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'rubro',
          fields: [
            campoTexto('titulo', 'Nombre del rubro'),
            campoParrafo('descripcion', 'Descripción'),
            fotoUnica('foto', 'Foto', 'La foto que representa al rubro.'),
          ],
          preview: { select: { title: 'titulo', subtitle: 'descripcion', media: 'foto.imagen' } },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    campoTexto('masTrabajosTitulo', 'Título de "Más trabajos"'),
    campoTitulo('antesDespuesTitulo', 'Título de antes y después'),
    campoParrafo('antesDespuesBajada', 'Bajada de antes y después', 'Los ejemplos se cargan en "Marcas > Antes y después".'),
    campoTitulo('procesoTitulo', 'Título del proceso'),
    defineField({
      name: 'pasos',
      title: 'Pasos del proceso',
      type: 'array',
      of: [defineArrayMember({ type: 'itemInfo' })],
      validation: (rule) => rule.required().min(1),
    }),
    campoTexto('paquetesTitulo', 'Título de los paquetes', 'Los paquetes se cargan en "Marcas > Paquetes".'),
    campoTexto('paquetesCta', 'Botón de cada paquete'),
  ],
  preview: { prepare: () => ({ title: 'Página de Marcas' }) },
});

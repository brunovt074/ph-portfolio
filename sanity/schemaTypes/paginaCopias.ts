import { defineType } from 'sanity';
import { campoParrafo, campoTexto, campoTitulo } from './campos';

export const paginaCopias = defineType({
  name: 'paginaCopias',
  title: 'Página de Copias de autor',
  type: 'document',
  fields: [
    campoTitulo('titulo', 'Título'),
    campoParrafo('bajada', 'Bajada'),
    campoTexto('cta', 'Botón de cada copia'),
    campoTexto('etiquetaEdicion', 'Etiqueta de la edición', 'Usá {edicion} y {disponibles}. Ejemplo: "Edición de {edicion} · quedan {disponibles}".'),
  ],
  preview: { prepare: () => ({ title: 'Página de Copias de autor' }) },
});

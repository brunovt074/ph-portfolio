import { defineType } from 'sanity';
import { campoParrafo, campoTexto, campoTitulo } from './campos';
import { fotoUnica } from './fotoUnica';

export const paginaObra = defineType({
  name: 'paginaObra',
  title: 'Página de Obra',
  type: 'document',
  fields: [
    fotoUnica('aperturaFoto', 'Foto de apertura', 'La imagen a pantalla completa con la que abre la Obra.'),
    campoTexto('aperturaSerieNumero', 'Apertura: número de la serie'),
    campoTexto('aperturaSerieTitulo', 'Apertura: título de la serie'),
    campoTitulo('aperturaLeyenda', 'Apertura: leyenda de la foto'),
    campoParrafo('frase', 'Frase de la obra'),
    campoTexto('seriesTitulo', 'Título del índice de series'),
    campoTitulo('sobreTitulo', 'Título de "Sobre la obra"'),
    campoTexto('muestrasTitulo', 'Título de muestras y publicaciones', 'Las muestras se cargan en "Ajustes generales".'),
    campoTitulo('copiasTitulo', 'Copias: título'),
    campoParrafo('copiasBajada', 'Copias: bajada'),
    campoTexto('copiasCta', 'Copias: botón'),
    campoTitulo('bandaTitulo', 'Banda de copias en cada serie: título'),
    campoTexto('bandaCta', 'Banda de copias en cada serie: botón'),
  ],
  preview: { prepare: () => ({ title: 'Página de Obra' }) },
});

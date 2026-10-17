import type { StructureResolver } from 'sanity/structure';
import { singletonItem } from './singletonItem';

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title('Contenidos')
    .items([
      S.listItem().title('Textos del sitio').child(S.list().title('Textos del sitio').items([singletonItem(S, 'textosDelSitio', 'Textos del sitio')])),
      S.listItem().title('Ajustes generales').child(S.list().title('Ajustes generales').items([singletonItem(S, 'ajustes', 'Ajustes generales')])),
      S.listItem()
        .title('Páginas')
        .child(
          S.list()
            .title('Páginas')
            .items([
              singletonItem(S, 'paginaInicio', 'Inicio'),
              singletonItem(S, 'paginaMarcas', 'Marcas'),
              singletonItem(S, 'paginaObra', 'Obra'),
              singletonItem(S, 'paginaCopias', 'Copias de autor'),
            ]),
        ),
      S.listItem().title('Facetas').child(S.documentTypeList('faceta').title('Facetas')),
      S.listItem()
        .title('Fotos')
        .child(
          S.list()
            .title('Fotos')
            .items([
              S.listItem().title('Todas las fotos').child(S.documentTypeList('foto').title('Todas las fotos')),
              S.listItem()
                .title('Por faceta')
                .child(
                  S.documentTypeList('faceta')
                    .title('Elegí una faceta')
                    .child((facetaId) =>
                      S.documentList()
                        .title('Fotos de la faceta')
                        .filter('_type == "foto" && $facetaId in facetas[]._ref')
                        .params({ facetaId }),
                    ),
                ),
              S.listItem().title('Destacadas').child(S.documentList().title('Fotos destacadas').filter('_type == "foto" && destacada == true')),
            ]),
        ),
      S.listItem()
        .title('Obra')
        .child(
          S.list()
            .title('Obra')
            .items([
              S.listItem().title('Series').child(S.documentTypeList('serie').title('Series')),
              S.listItem().title('Copias').child(S.documentTypeList('copia').title('Copias')),
            ]),
        ),
      S.listItem()
        .title('Marcas')
        .child(
          S.list()
            .title('Marcas')
            .items([
              S.listItem().title('Paquetes').child(S.documentTypeList('paqueteMarca').title('Paquetes')),
              S.listItem().title('Antes y después').child(S.documentTypeList('antesDespues').title('Antes y después')),
            ]),
        ),
    ]);

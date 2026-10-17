import { photoProjection } from './photoProjection';

export const printsQuery = `*[_type == "copia"] | order(orden asc){
  "id": _id,
  edicion,
  disponibles,
  activa,
  tamanos,
  "foto": foto->${photoProjection},
  "serie": serie->{ numero, slug, titulo }
}`;

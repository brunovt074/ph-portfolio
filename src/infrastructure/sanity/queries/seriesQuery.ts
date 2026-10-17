import { photoProjection } from './photoProjection';

export const seriesQuery = `*[_type == "serie"] | order(orden asc){
  ...,
  "fotos": fotos[]{ layout, "foto": foto->${photoProjection} }
}`;

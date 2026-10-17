import { photoProjection } from './photoProjection';

export const seriesQuery = `*[_type == "serie"] | order(orden asc){
  ...,
  "slug": slug.current,
  "fotos": fotos[]{ layout, "foto": foto->${photoProjection} }
}`;

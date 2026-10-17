import { photoProjection } from './photoProjection';

export const facetsQuery = `*[_type == "faceta"] | order(numero asc){
  ...,
  "slug": slug.current,
  "portada": portada[]->${photoProjection},
  "galeria": galeria[]->${photoProjection}
}`;

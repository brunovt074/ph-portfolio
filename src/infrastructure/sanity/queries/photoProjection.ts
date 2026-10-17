import { imageProjection } from './imageProjection';

export const photoProjection = `{
  "id": _id,
  alt,
  titulo,
  tituloProvisorio,
  lugar,
  anio,
  destacada,
  "facets": facetas[]->slug.current,
  "image": imagen${imageProjection}
}`;

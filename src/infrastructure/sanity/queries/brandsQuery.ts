import { photoProjection } from './photoProjection';

export const brandsQuery = `*[_id == "paginaMarcas"][0]{
  ...,
  "rubros": rubros[]{ titulo, descripcion, "foto": foto->${photoProjection} }
}`;

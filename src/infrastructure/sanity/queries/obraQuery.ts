import { photoProjection } from './photoProjection';

export const obraQuery = `*[_id == "paginaObra"][0]{
  ...,
  "aperturaFoto": aperturaFoto->${photoProjection}
}`;

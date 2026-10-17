import { photoProjection } from './photoProjection';

export const homeQuery = `*[_id == "paginaInicio"][0]{
  ...,
  "puertaEncargosFoto": puertaEncargosFoto->${photoProjection},
  "puertaObraFoto": puertaObraFoto->${photoProjection},
  "miniaturasEditorial": miniaturasEditorial[]->${photoProjection},
  "miniaturasRetratos": miniaturasRetratos[]->${photoProjection},
  "miniaturasMarcas": miniaturasMarcas[]->${photoProjection},
  "miniaturasEventos": miniaturasEventos[]->${photoProjection},
  "tiraEditorial": tiraEditorial[]->${photoProjection},
  "marcasGrilla": marcasGrilla[]->${photoProjection},
  "obraFotos": obraFotos[]->${photoProjection}
}`;

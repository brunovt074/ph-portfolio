import { imageProjection } from './imageProjection';

export const beforeAfterQuery = `*[_type == "antesDespues"] | order(orden asc){
  "id": _id,
  alt,
  provisorio,
  "antes": antes${imageProjection},
  "despues": despues${imageProjection}
}`;

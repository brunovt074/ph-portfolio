import { imageProjection } from './imageProjection';

export const settingsQuery = `*[_id == "ajustes"][0]{
  ...,
  "retrato": retrato${imageProjection}
}`;

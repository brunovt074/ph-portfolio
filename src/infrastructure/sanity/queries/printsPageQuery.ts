export const printsPageQuery = `*[_id == "paginaCopias"][0]{
  ...,
  "info": *[_id == "ajustes"][0].infoCopias
}`;

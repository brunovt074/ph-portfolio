export const brandPackagesQuery = `*[_type == "paqueteMarca"] | order(orden asc){ nombre, precio, items, destacado, orden }`;

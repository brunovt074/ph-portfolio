export class DuplicateRouteError extends Error {
  constructor(readonly path: string) {
    super(`Ruta duplicada: ${path}. Cambiá el slug de la serie.`);
    this.name = 'DuplicateRouteError';
  }
}

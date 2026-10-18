import { at, defineMigration, patch, set, type NodePatch } from 'sanity/migrate';
import type { PathSegment } from '@sanity/types';

interface FieldSpec {
  fields: string[];
  children?: Record<string, FieldSpec>;
}

const localizedFields: Record<string, FieldSpec> = {
  foto: { fields: ['alt', 'titulo'] },
  faceta: {
    fields: ['nombre', 'titulo', 'lead', 'indexDescription', 'quote', 'ctaTexto', 'ctaButton'],
    children: { servicios: { fields: ['titulo', 'descripcion', 'precio'] } },
  },
  servicio: { fields: ['titulo', 'descripcion', 'precio'] },
  itemInfo: { fields: ['titulo', 'descripcion'] },
  paqueteMarca: { fields: ['nombre', 'precio', 'items'] },
  antesDespues: { fields: ['alt'] },
  serie: { fields: ['titulo', 'tituloVisible', 'slug', 'lineaCuratorial', 'textoCuratorial'] },
  ajustes: {
    fields: ['frase', 'sobreMi', 'retratoAlt', 'statement'],
    children: {
      muestras: { fields: ['titulo'] },
      infoCopias: { fields: ['titulo', 'descripcion'] },
    },
  },
  paginaInicio: {
    fields: [
      'bajada',
      'puertaEncargosEtiqueta',
      'puertaEncargosTitulo',
      'puertaEncargosSubtitulo',
      'puertaObraEtiqueta',
      'puertaObraTitulo',
      'puertaObraSubtitulo',
      'ticker',
      'sobreMiCta',
      'encargosEyebrow',
      'encargosTitulo',
      'marcasEyebrow',
      'marcasTitulo',
      'marcasCta',
      'obraTitulo',
      'obraBajada',
      'obraCta',
      'contactoTitulo',
      'contactoBajada',
      'tiposDeTrabajo',
    ],
    children: { marcasServicios: { fields: ['titulo', 'descripcion', 'precio'] } },
  },
  paginaMarcas: {
    fields: ['ctaCabecera', 'rubrosTitulo', 'masTrabajosTitulo', 'antesDespuesTitulo', 'antesDespuesBajada', 'procesoTitulo', 'paquetesTitulo', 'paquetesCta'],
    children: {
      rubros: { fields: ['titulo', 'descripcion'] },
      pasos: { fields: ['titulo', 'descripcion'] },
    },
  },
  paginaObra: {
    fields: ['aperturaSerieNumero', 'aperturaSerieTitulo', 'aperturaLeyenda', 'frase', 'seriesTitulo', 'sobreTitulo', 'muestrasTitulo', 'copiasTitulo', 'copiasBajada', 'copiasCta', 'bandaTitulo', 'bandaCta'],
  },
  paginaCopias: { fields: ['titulo', 'bajada', 'cta', 'etiquetaEdicion'] },
  sesionReservable: { fields: ['titulo', 'descripcion'] },
};

const isLocalized = (value: unknown): boolean =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && 'es' in value;

const collectPatches = (doc: Record<string, unknown>, spec: FieldSpec, basePath: PathSegment[]): NodePatch[] => {
  const patches: NodePatch[] = [];
  for (const field of spec.fields) {
    if (!(field in doc)) continue;
    const value = doc[field];
    if (value === null || value === undefined || isLocalized(value)) continue;
    patches.push(at([...basePath, field], set({ es: value })));
  }
  for (const [childField, childSpec] of Object.entries(spec.children ?? {})) {
    const items = doc[childField];
    if (!Array.isArray(items)) continue;
    items.forEach((item, index) => {
      if (typeof item !== 'object' || item === null) return;
      patches.push(...collectPatches(item as Record<string, unknown>, childSpec, [...basePath, childField, index]));
    });
  }
  return patches;
};

const collectLocalizationPatches = (doc: Record<string, unknown>): NodePatch[] => {
  const spec = localizedFields[String(doc._type)];
  return spec ? collectPatches(doc, spec, []) : [];
};

export default defineMigration({
  title: 'Wrap existing localized fields in a Spanish-only { es: … } object',
  documentTypes: Object.keys(localizedFields),
  migrate: {
    document(doc) {
      const patches = collectLocalizationPatches(doc as Record<string, unknown>);
      return patches.length > 0 ? patch(doc._id ?? '', patches) : undefined;
    },
  },
});

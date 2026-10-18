export interface LocalizedFieldSpec {
  fields: readonly string[];
  arrays?: Readonly<Record<string, readonly string[]>>;
}

const service = ['titulo', 'descripcion', 'precio'] as const;
const info = ['titulo', 'descripcion'] as const;

export const localizedFieldSpecs: Readonly<Record<string, LocalizedFieldSpec>> = {
  foto: { fields: ['alt', 'titulo'] },
  faceta: {
    fields: ['nombre', 'titulo', 'lead', 'indexDescription', 'quote', 'ctaTexto', 'ctaButton'],
    arrays: { servicios: service },
  },
  paqueteMarca: { fields: ['nombre', 'precio', 'items'] },
  antesDespues: { fields: ['alt'] },
  serie: { fields: ['titulo', 'tituloVisible', 'slug', 'lineaCuratorial', 'textoCuratorial'] },
  ajustes: {
    fields: ['frase', 'sobreMi', 'retratoAlt', 'statement'],
    arrays: { muestras: ['titulo'], infoCopias: info },
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
    arrays: { marcasServicios: service },
  },
  paginaMarcas: {
    fields: [
      'ctaCabecera',
      'rubrosTitulo',
      'masTrabajosTitulo',
      'antesDespuesTitulo',
      'antesDespuesBajada',
      'procesoTitulo',
      'paquetesTitulo',
      'paquetesCta',
    ],
    arrays: { rubros: info, pasos: info },
  },
  paginaObra: {
    fields: [
      'aperturaSerieNumero',
      'aperturaSerieTitulo',
      'aperturaLeyenda',
      'frase',
      'seriesTitulo',
      'sobreTitulo',
      'muestrasTitulo',
      'copiasTitulo',
      'copiasBajada',
      'copiasCta',
      'bandaTitulo',
      'bandaCta',
    ],
  },
  paginaCopias: { fields: ['titulo', 'bajada', 'cta', 'etiquetaEdicion'] },
};

export interface SeedPhoto {
  id: string;
  archivo: string;
  faceta: 'editorial' | 'retratos' | 'marcas' | 'eventos' | 'obra';
  alt: string;
  destacada?: boolean;
  titulo?: string;
  titulo_provisorio?: boolean;
  lugar?: string;
  anio?: number | null;
}

export interface SeedSeriesPhoto {
  foto: string;
  layout: 'centro' | 'izquierda' | 'derecha' | 'par' | 'sangre';
}

export interface SeedSeries {
  numero: string;
  titulo: string;
  lineaCuratorial: string;
  anios: string;
  fotos: SeedSeriesPhoto[];
}

export interface SeedPrintSize {
  medida: string;
  precio: string;
}

export interface SeedPrint {
  foto: string;
  edicion: number;
  disponibles: number | null;
  tamanos: SeedPrintSize[];
}

export interface SeedBrandPackage {
  nombre: string;
  precio: string;
  destacado?: boolean;
  items: string[];
}

export interface SeedSettings {
  email: string;
  whatsapp: string;
  instagram: string[];
  frase: string;
  sobre_mi: string;
  statement: string;
  retrato: string;
}

export interface SeedData {
  ajustes: SeedSettings;
  fotos: SeedPhoto[];
  series: SeedSeries[];
  copias: SeedPrint[];
  paquetesMarca: SeedBrandPackage[];
}

import type { SeedPrintSize } from './SeedPrintSize';

export interface SeedPrint {
  foto: string;
  edicion: number;
  disponibles: number | null;
  tamanos: SeedPrintSize[];
}

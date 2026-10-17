import type { SeedBrandPackage } from './SeedBrandPackage';
import type { SeedPhoto } from './SeedPhoto';
import type { SeedPrint } from './SeedPrint';
import type { SeedSeries } from './SeedSeries';
import type { SeedSettings } from './SeedSettings';

export interface SeedData {
  ajustes: SeedSettings;
  fotos: SeedPhoto[];
  series: SeedSeries[];
  copias: SeedPrint[];
  paquetesMarca: SeedBrandPackage[];
}

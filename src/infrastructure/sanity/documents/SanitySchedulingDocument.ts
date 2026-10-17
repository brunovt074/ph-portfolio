import type { SanitySchedulingWindow } from './SanitySchedulingWindow';

export interface SanitySchedulingDocument {
  ventanas?: SanitySchedulingWindow[] | null;
  pasoMinutos?: number | null;
  margenMinutos?: number | null;
  anticipacionHoras?: number | null;
  horizonteDias?: number | null;
  retencionMinutos?: number | null;
  zonaHoraria?: string | null;
}

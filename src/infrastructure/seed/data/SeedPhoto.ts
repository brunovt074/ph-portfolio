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
  hotspot?: { x: number; y: number; width: number; height: number };
}

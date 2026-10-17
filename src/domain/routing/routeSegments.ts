import type { Locale } from '../Locale';
import type { StaticRouteKey } from './StaticRouteKey';

export const routeSegments: Record<StaticRouteKey | 'obraBase', Record<Locale, string>> = {
  home: { es: '', en: '', pt: '' },
  editorial: { es: 'editorial', en: 'editorial', pt: 'editorial' },
  retratos: { es: 'retratos', en: 'portraits', pt: 'retratos' },
  marcas: { es: 'marcas', en: 'brands', pt: 'marcas' },
  eventos: { es: 'eventos', en: 'events', pt: 'eventos' },
  obra: { es: 'obra', en: 'work', pt: 'obra' },
  copias: { es: 'obra/copias', en: 'work/prints', pt: 'obra/copias' },
  reservas: { es: 'reservas', en: 'bookings', pt: 'reservas' },
  obraBase: { es: 'obra', en: 'work', pt: 'obra' },
};

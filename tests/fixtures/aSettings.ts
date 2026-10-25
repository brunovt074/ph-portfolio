import type { SiteSettings } from '@/domain/SiteSettings';
import { aPhoto } from './aPhoto';

export const aSettings = (): SiteSettings => ({
  email: '[EMAIL]',
  whatsapp: '[NÚMERO]',
  instagram: ['@sarahmoreau.foto'],
  quote: 'Cada fotografía es un registro de nuestro paso.',
  about: '[Trayectoria, ciudad y formación]',
  portrait: aPhoto({ id: 'retrato-sarah', facet: 'retratos' }),
  artistStatement: '[Statement artístico]',
  exhibitions: [],
  printInfo: [],
});

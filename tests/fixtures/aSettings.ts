import type { SiteSettings } from '@/domain/SiteSettings';
import { aPhoto } from './aPhoto';

export const aSettings = (): SiteSettings => ({
  email: '[EMAIL]',
  whatsapp: '[NÚMERO]',
  instagram: ['@laravischi.fotografia'],
  quote: 'Cada fotografía es un registro de nuestro paso.',
  about: '[Trayectoria, ciudad y formación]',
  portrait: aPhoto({ id: 'retrato-lara', facet: 'retratos' }),
  artistStatement: '[Statement artístico]',
  exhibitions: [],
  printInfo: [],
});

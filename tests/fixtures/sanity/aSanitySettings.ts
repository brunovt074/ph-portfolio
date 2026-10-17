import type { SanitySettingsDocument } from '@/infrastructure/sanity/documents/SanitySettingsDocument';
import { aBareSanityImage, aSanityPhoto } from './aSanityPhoto';

export const aSanitySettings = (overrides: Partial<SanitySettingsDocument> = {}): SanitySettingsDocument => ({
  email: '[EMAIL]',
  whatsapp: '[NÚMERO]',
  instagram: ['@sarahmoreau.ph'],
  frase: { es: 'Cada fotografía es un registro de nuestro paso.' },
  sobreMi: { es: '[Trayectoria, ciudad y formación]' },
  statement: { es: '[Statement artístico]' },
  retratoAlt: { es: 'Sarah Moreau con su cámara, en blanco y negro' },
  retrato: aSanityPhoto({ id: 'x' }).image,
  muestras: [{ titulo: { es: '[Muestra o publicación]' }, lugar: '[Lugar]', anio: '[AÑO]' }],
  infoCopias: [{ titulo: { es: 'Envío' }, descripcion: { es: '[Zonas y tiempos de envío]' } }],
  ...overrides,
});

export const aSettingsWithoutOptionals = (): SanitySettingsDocument =>
  aSanitySettings({ muestras: null, infoCopias: null, retrato: aBareSanityImage() });

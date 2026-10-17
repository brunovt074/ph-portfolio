import type { SanitySettingsDocument } from '@/infrastructure/sanity/documents/SanitySettingsDocument';
import { aBareSanityImage, aSanityPhoto } from './aSanityPhoto';

export const aSanitySettings = (overrides: Partial<SanitySettingsDocument> = {}): SanitySettingsDocument => ({
  email: '[EMAIL]',
  whatsapp: '[NÚMERO]',
  instagram: ['@laravischi.fotografia'],
  frase: 'Cada fotografía es un registro de nuestro paso.',
  sobreMi: '[Trayectoria, ciudad y formación]',
  statement: '[Statement artístico]',
  retratoAlt: 'Lara Vischi con su cámara, en blanco y negro',
  retrato: aSanityPhoto({ id: 'x' }).image,
  muestras: [{ titulo: '[Muestra o publicación]', lugar: '[Lugar]', anio: '[AÑO]' }],
  infoCopias: [{ titulo: 'Envío', descripcion: '[Zonas y tiempos de envío]' }],
  ...overrides,
});

export const aSettingsWithoutOptionals = (): SanitySettingsDocument =>
  aSanitySettings({ muestras: null, infoCopias: null, retrato: aBareSanityImage() });

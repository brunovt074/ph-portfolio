import type { SiteTexts } from '@/domain/SiteTexts';
import type { FieldName } from './FieldName';

export const fieldErrorKeys: Record<FieldName, keyof SiteTexts['contact']> = {
  nombre: 'errorNombre',
  email: 'errorEmail',
  tipo: 'errorTipo',
  mensaje: 'errorMensaje',
  copia: 'errorCopia',
};

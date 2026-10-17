import type { Locale } from '@/domain/Locale';
import type { Service } from '@/domain/Service';
import type { SanityService } from '../documents/SanityService';
import { localize, localizeText } from './localize';

export const toService = (service: SanityService, locale: Locale): Service => {
  const description = localize(service.descripcion, locale);
  const price = localize(service.precio, locale);
  return {
    title: localizeText(service.titulo, locale),
    ...(description !== undefined && { description }),
    ...(price !== undefined && { price }),
  };
};

import type { Service } from '@/domain/Service';
import type { SanityService } from '../documents/SanityService';

export const toService = (service: SanityService): Service => ({
  title: service.titulo,
  ...(service.descripcion != null && { description: service.descripcion }),
  ...(service.precio != null && { price: service.precio }),
});

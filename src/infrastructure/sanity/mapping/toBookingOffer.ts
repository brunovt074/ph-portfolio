import type { BookingOffer } from '@/domain/booking/BookingOffer';
import type { SanityBookingOfferDocument } from '../documents/SanityBookingOfferDocument';
import { isFacetSlug } from './isFacetSlug';

const DEFAULT_DEPOSIT_PERCENT = 50;

export const toBookingOffer = (document: SanityBookingOfferDocument): BookingOffer | null => {
  if (document.faceta == null || !isFacetSlug(document.faceta)) {
    return null;
  }
  return {
    slug: document.slug,
    title: document.titulo,
    description: document.descripcion ?? '',
    facet: document.faceta,
    priceCents: document.precio != null && document.precio > 0 ? Math.round(document.precio * 100) : null,
    durationMinutes: document.duracionMinutos != null && document.duracionMinutos > 0 ? document.duracionMinutos : null,
    depositPercent: document.porcentajeSena ?? DEFAULT_DEPOSIT_PERCENT,
    order: document.orden ?? 0,
  };
};

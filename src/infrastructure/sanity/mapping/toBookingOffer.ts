import type { BookingOffer } from '@/domain/booking/BookingOffer';
import type { Locale } from '@/domain/Locale';
import type { SanityBookingOfferDocument } from '../documents/SanityBookingOfferDocument';
import { isFacetSlug } from './isFacetSlug';
import { localizeText } from './localize';
import { translationsOf } from './translationsOf';

const DEFAULT_DEPOSIT_PERCENT = 50;

export const toBookingOffer = (document: SanityBookingOfferDocument, locale: Locale): BookingOffer | null => {
  if (document.faceta == null || !isFacetSlug(document.faceta)) {
    return null;
  }
  return {
    slug: document.slug,
    title: localizeText(document.titulo, locale),
    description: localizeText(document.descripcion, locale),
    facet: document.faceta,
    priceCents: document.precio != null && document.precio > 0 ? Math.round(document.precio * 100) : null,
    durationMinutes: document.duracionMinutos != null && document.duracionMinutos > 0 ? document.duracionMinutos : null,
    depositPercent: document.porcentajeSena ?? DEFAULT_DEPOSIT_PERCENT,
    order: document.orden ?? 0,
    translations: translationsOf(document.titulo, document.descripcion ?? ''),
  };
};

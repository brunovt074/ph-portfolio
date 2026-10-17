import type { BrandPackage } from '@/domain/BrandPackage';
import type { BrandsContent } from '@/domain/BrandsContent';
import type { BeforeAfterPair } from '@/domain/BeforeAfterPair';
import type { Locale } from '@/domain/Locale';
import type { SanityBeforeAfterDocument } from '../documents/SanityBeforeAfterDocument';
import type { SanityBrandPackageDocument } from '../documents/SanityBrandPackageDocument';
import type { SanityBrandsDocument } from '../documents/SanityBrandsDocument';
import { localizeList, localizeText } from './localize';
import { toImagePhoto } from './toImagePhoto';
import { toInfoItem } from './toInfoItem';
import { toPhoto } from './toPhoto';
import { toRichTitle } from './toRichTitle';
import { translationsOf } from './translationsOf';

const toPackage = (document: SanityBrandPackageDocument, index: number, locale: Locale): BrandPackage => ({
  name: localizeText(document.nombre, locale),
  price: localizeText(document.precio, locale),
  items: localizeList(document.items, locale),
  featured: document.destacado ?? false,
  order: index,
});

const toPair = (pair: SanityBeforeAfterDocument, locale: Locale): BeforeAfterPair => {
  const alt = localizeText(pair.alt, locale);
  return {
    before: toImagePhoto(`${pair.id}-antes`, alt, 'marcas', pair.antes),
    after: toImagePhoto(`${pair.id}-despues`, alt, 'marcas', pair.despues),
    alt,
    provisional: pair.provisorio ?? false,
  };
};

export const toBrands = (
  page: SanityBrandsDocument,
  packages: SanityBrandPackageDocument[],
  pairs: SanityBeforeAfterDocument[],
  locale: Locale,
): BrandsContent => ({
  headerCta: localizeText(page.ctaCabecera, locale),
  sectorsTitle: localizeText(page.rubrosTitulo, locale),
  sectors: page.rubros.map((sector) => ({
    title: localizeText(sector.titulo, locale),
    description: localizeText(sector.descripcion, locale),
    photo: toPhoto(sector.foto, locale),
  })),
  moreWorkTitle: localizeText(page.masTrabajosTitulo, locale),
  beforeAfterTitle: toRichTitle(page.antesDespuesTitulo, locale),
  beforeAfterLead: localizeText(page.antesDespuesBajada, locale),
  beforeAfter: pairs.map((pair) => toPair(pair, locale)),
  processTitle: toRichTitle(page.procesoTitulo, locale),
  steps: page.pasos.map((step) => toInfoItem(step, locale)),
  packagesTitle: localizeText(page.paquetesTitulo, locale),
  packagesCta: localizeText(page.paquetesCta, locale),
  packages: packages.map((pack, index) => toPackage(pack, index, locale)),
  translations: translationsOf(page.rubrosTitulo, page.antesDespuesBajada),
});

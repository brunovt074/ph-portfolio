import type { BrandPackage } from '@/domain/BrandPackage';
import type { BrandsContent } from '@/domain/BrandsContent';
import type { SanityBeforeAfterDocument } from '../documents/SanityBeforeAfterDocument';
import type { SanityBrandPackageDocument } from '../documents/SanityBrandPackageDocument';
import type { SanityBrandsDocument } from '../documents/SanityBrandsDocument';
import { toImagePhoto } from './toImagePhoto';
import { toInfoItem } from './toInfoItem';
import { toPhoto } from './toPhoto';
import { toRichTitle } from './toRichTitle';

const toPackage = (document: SanityBrandPackageDocument, index: number): BrandPackage => ({
  name: document.nombre,
  price: document.precio,
  items: document.items,
  featured: document.destacado ?? false,
  order: index,
});

export const toBrands = (
  page: SanityBrandsDocument,
  packages: SanityBrandPackageDocument[],
  pairs: SanityBeforeAfterDocument[],
): BrandsContent => ({
  headerCta: page.ctaCabecera,
  sectorsTitle: page.rubrosTitulo,
  sectors: page.rubros.map((sector) => ({
    title: sector.titulo,
    description: sector.descripcion,
    photo: toPhoto(sector.foto),
  })),
  moreWorkTitle: page.masTrabajosTitulo,
  beforeAfterTitle: toRichTitle(page.antesDespuesTitulo),
  beforeAfterLead: page.antesDespuesBajada,
  beforeAfter: pairs.map((pair) => ({
    before: toImagePhoto(`${pair.id}-antes`, pair.alt, 'marcas', pair.antes),
    after: toImagePhoto(`${pair.id}-despues`, pair.alt, 'marcas', pair.despues),
    alt: pair.alt,
    provisional: pair.provisorio ?? false,
  })),
  processTitle: toRichTitle(page.procesoTitulo),
  steps: page.pasos.map(toInfoItem),
  packagesTitle: page.paquetesTitulo,
  packagesCta: page.paquetesCta,
  packages: packages.map(toPackage),
});

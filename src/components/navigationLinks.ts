import type { HeaderLink } from './HeaderLink';

export type HeaderVariant = 'site' | 'obra';

const siteLinks: HeaderLink[] = [
  { key: 'editorial', label: 'Editorial', href: '/editorial' },
  { key: 'retratos', label: 'Retratos', href: '/retratos' },
  { key: 'marcas', label: 'Marcas', href: '/marcas' },
  { key: 'eventos', label: 'Eventos', href: '/eventos' },
  { key: 'obra', label: 'Obra', href: '/obra' },
];

const obraLinks: HeaderLink[] = [
  { key: 'series', label: 'Series', href: '/obra#series' },
  { key: 'copias', label: 'Copias de autor', href: '/obra/copias' },
  { key: 'sobre', label: 'Sobre la obra', href: '/obra#sobre' },
  { key: 'encargos', label: 'Encargos', href: '/#encargos', muted: true },
];

export const navigationLinks = (variant: HeaderVariant): HeaderLink[] => (variant === 'obra' ? obraLinks : siteLinks);

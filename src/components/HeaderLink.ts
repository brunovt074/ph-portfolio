import type { NavLink } from '@/domain/NavLink';

export interface HeaderLink extends NavLink {
  key: string;
  muted?: boolean;
}

import type { StaticRouteKey } from './StaticRouteKey';

export type RouteTarget =
  | { route: StaticRouteKey; hash?: string; query?: Record<string, string> }
  | { route: 'serie'; slug: string; hash?: string };

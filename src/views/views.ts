import type { RouteKey } from '@/domain/routing/RouteKey';
import EditorialView from './EditorialView.astro';
import EventosView from './EventosView.astro';
import HomeView from './HomeView.astro';
import MarcasView from './MarcasView.astro';
import ObraView from './ObraView.astro';
import PrintsView from './PrintsView.astro';
import ReservasView from './ReservasView.astro';
import RetratosView from './RetratosView.astro';
import SeriesView from './SeriesView.astro';

export const views: Record<RouteKey, typeof HomeView | typeof SeriesView> = {
  home: HomeView,
  editorial: EditorialView,
  retratos: RetratosView,
  marcas: MarcasView,
  eventos: EventosView,
  obra: ObraView,
  copias: PrintsView,
  reservas: ReservasView,
  serie: SeriesView,
};

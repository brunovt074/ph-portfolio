import { describe, expect, it } from 'vitest';
import { DuplicateRouteError } from '@/domain/routing/DuplicateRouteError';
import { localizedPaths } from '@/domain/routing/localizedPaths';

describe('localizedPaths', () => {
  it('lists every page of a language including its series', () => {
    expect(localizedPaths('en', ['trades']).map((entry) => entry.path)).toEqual([
      '/en/', '/en/editorial', '/en/portraits', '/en/brands', '/en/events', '/en/work', '/en/work/prints', '/en/bookings', '/en/work/trades',
    ]);
  });

  it('lists every Spanish page with its prefix', () => {
    expect(localizedPaths('es', ['oficios']).map((entry) => entry.path)).toEqual([
      '/es/', '/es/editorial', '/es/retratos', '/es/marcas', '/es/eventos', '/es/obra', '/es/obra/copias', '/es/reservas', '/es/obra/oficios',
    ]);
  });

  it('describes series entries with their route and slug', () => {
    expect(localizedPaths('pt', ['oficios']).at(-1)).toEqual({ locale: 'pt', path: '/pt/obra/oficios', route: 'serie', slug: 'oficios' });
  });

  it('rejects a series slug that collides with a fixed page', () => {
    expect(() => localizedPaths('en', ['prints'])).toThrow(new DuplicateRouteError('/en/work/prints'));
  });

  it('rejects two series sharing a slug', () => {
    expect(() => localizedPaths('pt', ['oficios', 'oficios'])).toThrow(DuplicateRouteError);
  });

  it('explains the collision in Spanish', () => {
    expect(new DuplicateRouteError('/x').message).toBe('Ruta duplicada: /x. Cambiá el slug de la serie.');
  });
});

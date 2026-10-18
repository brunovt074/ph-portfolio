import { describe, expect, it } from 'vitest';
import { pathTo } from '@/domain/routing/pathTo';

describe('pathTo', () => {
  it('links the home page of each language', () => {
    expect(pathTo('es', { route: 'home' })).toBe('/es/');
    expect(pathTo('en', { route: 'home' })).toBe('/en/');
  });

  it('translates section segments for English and Portuguese visitors', () => {
    expect(pathTo('en', { route: 'retratos' })).toBe('/en/portraits');
    expect(pathTo('pt', { route: 'copias' })).toBe('/pt/obra/copias');
    expect(pathTo('en', { route: 'reservas' })).toBe('/en/bookings');
    expect(pathTo('pt', { route: 'reservas' })).toBe('/pt/reservas');
  });

  it('links a series under the translated work segment', () => {
    expect(pathTo('es', { route: 'serie', slug: 'oficios' })).toBe('/es/obra/oficios');
    expect(pathTo('en', { route: 'serie', slug: 'trades' })).toBe('/en/work/trades');
  });

  it('appends query and hash for deep links into the contact form', () => {
    expect(pathTo('es', { route: 'home', hash: 'contacto', query: { tipo: 'editorial' } })).toBe('/es/?tipo=editorial#contacto');
    expect(pathTo('en', { route: 'home', hash: 'encargos' })).toBe('/en/#encargos');
  });

  it('encodes the print title when linking a print enquiry', () => {
    expect(pathTo('es', { route: 'copias', query: { copia: 'Bidones, 2024' } })).toBe('/es/obra/copias?copia=Bidones%2C+2024');
  });

  it('links a series hash', () => {
    expect(pathTo('pt', { route: 'serie', slug: 'oficios', hash: 'fotos' })).toBe('/pt/obra/oficios#fotos');
  });
});

import { describe, expect, it } from 'vitest';
import { localizeFieldPatches } from '../../migrations/localize-fields/localizeFieldPatches';

const block = [{ _type: 'block', _key: 'b', children: [{ _type: 'span', _key: 's', text: 'Hola' }] }];

describe('localizeFieldPatches', () => {
  it('wraps plain Spanish fields of a series, including the slug and the rich title', () => {
    const patches = localizeFieldPatches({
      _type: 'serie',
      titulo: 'Oficios',
      tituloVisible: block,
      slug: { _type: 'slug', current: 'oficios' },
      numero: '01',
    });

    expect(patches).toEqual([
      { path: ['titulo'], value: { es: 'Oficios' } },
      { path: ['tituloVisible'], value: { es: block } },
      { path: ['slug'], value: { es: { _type: 'slug', current: 'oficios' } } },
    ]);
  });

  it('leaves already localized fields alone so the migration can run twice', () => {
    const patches = localizeFieldPatches({
      _type: 'serie',
      titulo: { _type: 'textoLocalizado', es: 'Oficios', en: 'Trades' },
      slug: { _type: 'slugLocalizado', es: { _type: 'slug', current: 'oficios' } },
    });

    expect(patches).toEqual([]);
  });

  it('wraps the fields of services inside a facet addressing them by key', () => {
    const patches = localizeFieldPatches({
      _type: 'faceta',
      nombre: { es: 'Editorial' },
      servicios: [
        { _key: 'servicio-0', _type: 'servicio', titulo: 'Campaña', precio: '[PRECIO]' },
        { _key: 'servicio-1', _type: 'servicio', titulo: { es: 'Lookbook' } },
      ],
    });

    expect(patches).toEqual([
      { path: ['servicios', { _key: 'servicio-0' }, 'titulo'], value: { es: 'Campaña' } },
      { path: ['servicios', { _key: 'servicio-0' }, 'precio'], value: { es: '[PRECIO]' } },
    ]);
  });

  it('skips missing optional fields and missing arrays', () => {
    expect(localizeFieldPatches({ _type: 'ajustes', frase: null, muestras: undefined })).toEqual([]);
  });

  it('ignores document types without translatable text', () => {
    expect(localizeFieldPatches({ _type: 'copia', edicion: '10' })).toEqual([]);
  });
});

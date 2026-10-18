import { describe, expect, it } from 'vitest';
import { locales } from '@/domain/Locale';
import { CachedSanityClient } from '@/infrastructure/sanity/CachedSanityClient';
import type { SanityPhotoDocument } from '@/infrastructure/sanity/documents/SanityPhotoDocument';
import { homeQuery } from '@/infrastructure/sanity/queries/homeQuery';
import { defaultSiteTexts } from '@/infrastructure/texts/defaults/defaultSiteTexts';
import { SanityContentRepository } from '@/infrastructure/sanity/SanityContentRepository';
import { SanityDocumentNotFoundError } from '@/infrastructure/sanity/SanityDocumentNotFoundError';
import { aBareSanityImage, aSanityPhoto } from '../../fixtures/sanity/aSanityPhoto';
import { aSanityBeforeAfter, aSanityBrands, aSanityPackage } from '../../fixtures/sanity/aSanityBrands';
import { aSanityBookingOffer } from '../../fixtures/sanity/aSanityBookingOffer';
import { aSanityFacet } from '../../fixtures/sanity/aSanityFacet';
import { aSanityHome } from '../../fixtures/sanity/aSanityHome';
import { aSanityObra, aSanityPrint, aSanityPrintsPage, aSanitySeries } from '../../fixtures/sanity/aSanityObra';
import { aSanitySettings, aSettingsWithoutOptionals } from '../../fixtures/sanity/aSanitySettings';
import { aSanitySiteTexts } from '../../fixtures/sanity/aSanitySiteTexts';
import { aSanityTitle } from '../../fixtures/sanity/aSanityTitle';
import { aSanityClient } from '../../fixtures/sanity/aSanityWorld';

const repositoryWith = (overrides: Parameters<typeof aSanityClient>[0] = {}) =>
  new SanityContentRepository(aSanityClient(overrides));

describe('SanityContentRepository', () => {
  describe('photos', () => {
    it('maps a photo with hotspot, lqip and dimensions so the image pipeline can crop it', async () => {
      const [facet] = await repositoryWith().getFacets('es');

      expect(facet?.gallery[0]).toEqual({
        id: 'rt01',
        asset: {
          provider: 'sanity',
          ref: 'image-a1b2c3-1600x2000-jpg',
          hotspot: { x: 0.3, y: 0.7 },
          lqip: 'data:image/jpeg;base64,AAAA',
          width: 1600,
          height: 2000,
        },
        alt: 'Modelo de peluca roja con gorro de piel blanco',
        facet: 'retratos',
        featured: true,
      });
    });

    it('centers a photo that Lara never gave a hotspot', async () => {
      const photo = aSanityPhoto({ image: aBareSanityImage(), destacada: null, facets: null });
      const repository = repositoryWith({ facets: [aSanityFacet({ galeria: [photo] })] });

      const [facet] = await repository.getFacets('es');

      expect(facet?.gallery[0]?.asset).toEqual({ provider: 'sanity', ref: 'image-bare-800x600-jpg' });
      expect(facet?.gallery[0]?.facet).toBe('obra');
      expect(facet?.gallery[0]?.featured).toBe(false);
    });

    it('keeps title, place and year of a series photo', async () => {
      const photo = aSanityPhoto({ titulo: 'Bidones', tituloProvisorio: true, lugar: 'Rosario', anio: 2024, facets: [] });
      const repository = repositoryWith({ facets: [aSanityFacet({ galeria: [photo] })] });

      const [facet] = await repository.getFacets('es');

      expect(facet?.gallery[0]).toMatchObject({ title: 'Bidones', provisionalTitle: true, place: 'Rosario', year: 2024 });
    });

    it('skips a gallery reference that points to a deleted photo', async () => {
      const [facet] = await repositoryWith().getFacets('es');

      expect(facet?.cover).toHaveLength(1);
    });

    it('skips a photo whose image Lara has not uploaded yet', async () => {
      const unfinished = aSanityPhoto({ id: 'foto-sin-imagen', image: { asset: null } as unknown as SanityPhotoDocument['image'] });
      const repository = repositoryWith({ facets: [aSanityFacet({ galeria: [unfinished, aSanityPhoto({ id: 'foto-rt01' })] })] });

      const [facet] = await repository.getFacets('es');

      expect(facet?.gallery.map((photo) => photo.id)).toEqual(['rt01']);
    });

    it('keeps reading a photo alt saved before the migration', async () => {
      const repository = repositoryWith({ facets: [aSanityFacet({ galeria: [aSanityPhoto({ alt: 'Texto plano' })] })] });

      const [facet] = await repository.getFacets('en');

      expect(facet?.gallery[0]?.alt).toBe('Texto plano');
    });

    it('localizes photo alt text and title', async () => {
      const photo = aSanityPhoto({
        alt: { es: 'Modelo con peluca roja', en: 'Model wearing a red wig' },
        titulo: { es: 'Bidones', en: 'Jerrycans' },
      });
      const repository = repositoryWith({ facets: [aSanityFacet({ galeria: [photo] })] });

      const [facet] = await repository.getFacets('en');

      expect(facet?.gallery[0]).toMatchObject({ alt: 'Model wearing a red wig', title: 'Jerrycans' });
    });

    it('treats a missing gallery as empty', async () => {
      const repository = repositoryWith({ facets: [aSanityFacet({ portada: null, galeria: null })] });

      const [facet] = await repository.getFacets('es');

      expect(facet?.cover).toEqual([]);
      expect(facet?.gallery).toEqual([]);
    });
  });

  describe('facets', () => {
    it('turns a title with an italic word into segments', async () => {
      const [facet] = await repositoryWith().getFacets('es');

      expect(facet?.title).toEqual([
        { text: 'Personas, ', italic: false },
        { text: 'sin pose', italic: true },
      ]);
      expect(facet?.quote).toEqual([
        { text: 'Creemos que tenemos mucho ', italic: false },
        { text: 'tiempo', italic: true },
        { text: '. Las fotos nos recuerdan que no.', italic: false },
      ]);
    });

    it('drops empty segments left by the editor', async () => {
      const repository = repositoryWith({ facets: [aSanityFacet({ titulo: aSanityTitle([''], ['Solo itálica', true]) })] });

      const [facet] = await repository.getFacets('es');

      expect(facet?.title).toEqual([{ text: 'Solo itálica', italic: true }]);
    });

    it('maps services and omits the prices Lara left blank', async () => {
      const [facet] = await repositoryWith().getFacets('es');

      expect(facet?.services).toEqual([
        { title: 'Retrato personal', description: 'Una sesión para vos.', price: '[PRECIO]' },
        { title: 'Marca personal' },
      ]);
    });

    it('discards a facet whose slug the site does not know', async () => {
      const repository = repositoryWith({ facets: [aSanityFacet({ slug: 'bodas' }), aSanityFacet({ slug: 'eventos' })] });

      const facets = await repository.getFacets('es');

      expect(facets.map((facet) => facet.slug)).toEqual(['eventos']);
    });

    it('localizes rich titles keeping the italic word', async () => {
      const titulo = { es: aSanityTitle(['Personas, '], ['sin pose', true]), en: aSanityTitle(['People, '], ['unposed', true]) };
      const repository = repositoryWith({ facets: [aSanityFacet({ titulo })] });

      const [facet] = await repository.getFacets('en');

      expect(facet?.title).toEqual([
        { text: 'People, ', italic: false },
        { text: 'unposed', italic: true },
      ]);
    });

    it('localizes the facet texts and its services', async () => {
      const repository = repositoryWith({
        facets: [
          aSanityFacet({
            nombre: { es: 'Retratos & Estudio', pt: 'Retratos & Estúdio' },
            ctaButton: { es: 'Reservar sesión', pt: 'Reservar sessão' },
            servicios: [{ titulo: { es: 'Retrato personal', pt: 'Retrato pessoal' }, descripcion: { es: 'Una sesión para vos.' }, precio: { es: '[PRECIO]' } }],
          }),
        ],
      });

      const [facet] = await repository.getFacets('pt');

      expect(facet).toMatchObject({ name: 'Retratos & Estúdio', ctaButton: 'Reservar sessão' });
      expect(facet?.services).toEqual([{ title: 'Retrato pessoal', description: 'Una sesión para vos.', price: '[PRECIO]' }]);
    });

    it('marks a facet as translated only when its title and lead are', async () => {
      const titulo = { es: aSanityTitle(['Personas']), en: aSanityTitle(['People']), pt: aSanityTitle(['Pessoas']) };
      const repository = repositoryWith({ facets: [aSanityFacet({ titulo, lead: { es: 'Sesiones.', en: 'Sessions.' } })] });

      const [facet] = await repository.getFacets('es');

      expect(facet?.translations).toEqual({ es: true, en: true, pt: false });
    });

    it('maps the facet texts and omits the optional quote', async () => {
      const repository = repositoryWith({ facets: [aSanityFacet({ quote: null, servicios: null })] });

      const [facet] = await repository.getFacets('es');

      expect(facet).toMatchObject({ slug: 'retratos', number: 2, name: 'Retratos & Estudio', ctaText: 'Reservá tu sesión', ctaButton: 'Reservar sesión', services: [] });
      expect(facet).not.toHaveProperty('quote');
    });
  });

  describe('home', () => {
    it('maps both doors with their destinations', async () => {
      const home = await repositoryWith().getHome('es');

      expect(home.encargosDoor).toMatchObject({ href: '/es/#encargos', label: 'Puerta 1', subtitle: 'Editorial · Retratos · Marcas · Eventos' });
      expect(home.obraDoor).toMatchObject({ href: '/es/obra', title: [{ text: 'Obra', italic: true }] });
    });

    it('maps thumbnails, strips, services and contact texts', async () => {
      const home = await repositoryWith().getHome('es');

      expect(home.facetThumbnails.retratos[0]?.id).toBe('rt02');
      expect(home.facetThumbnails.eventos[0]?.facet).toBe('eventos');
      expect(home.editorialStrip).toHaveLength(1);
      expect(home.brandServices).toEqual([{ title: 'Gastronomía', price: 'desde [PRECIO]' }]);
      expect(home.workTypes).toEqual(['Editorial & moda', 'Copia de autor']);
      expect(home.contactTitle).toBe('Hablemos.');
    });

    it('points the doors to the English pages and serves the English texts', async () => {
      const repository = repositoryWith({
        home: aSanityHome({ bajada: { es: 'Fotografía y video.', en: 'Photography and video.' }, ticker: { es: ['Editorial', 'Obra'], en: ['Editorial', 'Work'] } }),
      });

      const home = await repository.getHome('en');

      expect(home.encargosDoor.href).toBe('/en/#encargos');
      expect(home.obraDoor.href).toBe('/en/work');
      expect(home.lead).toBe('Photography and video.');
      expect(home.ticker).toEqual(['Editorial', 'Work']);
      expect(home.contactTitle).toBe('Hablemos.');
    });

    it('marks the home as translated only when its lead and Encargos door title are', async () => {
      const repository = repositoryWith({
        home: aSanityHome({
          bajada: { es: 'Fotografía y video.', en: 'Photography and video.', pt: 'Fotografia e vídeo.' },
          puertaEncargosTitulo: { es: aSanityTitle(['Encargos']), pt: aSanityTitle(['Encomendas']) },
        }),
      });

      const home = await repository.getHome('pt');

      expect(home.translations).toEqual({ es: true, en: false, pt: true });
    });

    it('treats a work type list Lara never filled as empty', async () => {
      const home = await repositoryWith({ home: aSanityHome({ tiposDeTrabajo: null }) }).getHome('es');

      expect(home.workTypes).toEqual([]);
    });

    it('tolerates a home without brand services', async () => {
      const home = await repositoryWith({ home: aSanityHome({ marcasServicios: null }) }).getHome('es');

      expect(home.brandServices).toEqual([]);
    });

    it('explains which document is missing when Lara has not created the home yet', async () => {
      const repository = repositoryWith({ home: null });

      await expect(repository.getHome('es')).rejects.toThrow(SanityDocumentNotFoundError);
      await expect(repository.getHome('es')).rejects.toThrow('paginaInicio');
    });
  });

  describe('settings', () => {
    it('builds the portrait photo and the contact data', async () => {
      const settings = await repositoryWith().getSettings('es');

      expect(settings.portrait).toMatchObject({ id: 'retrato-lara', facet: 'retratos', alt: 'Lara Vischi con su cámara, en blanco y negro' });
      expect(settings.exhibitions).toEqual([{ title: '[Muestra o publicación]', place: '[Lugar]', year: '[AÑO]' }]);
      expect(settings.printInfo).toEqual([{ title: 'Envío', description: '[Zonas y tiempos de envío]' }]);
      expect(settings.quote).toBe('Cada fotografía es un registro de nuestro paso.');
    });

    it('localizes the quote, the portrait description and the exhibition titles', async () => {
      const repository = repositoryWith({
        settings: aSanitySettings({
          frase: { es: 'Cada fotografía es un registro.', en: 'Every photograph is a record.' },
          retratoAlt: { es: 'Lara con su cámara', en: 'Lara holding her camera' },
          muestras: [{ titulo: { es: 'Muestra colectiva', en: 'Group show' }, lugar: 'Rosario', anio: '2024' }],
        }),
      });

      const settings = await repository.getSettings('en');

      expect(settings.quote).toBe('Every photograph is a record.');
      expect(settings.portrait.alt).toBe('Lara holding her camera');
      expect(settings.exhibitions).toEqual([{ title: 'Group show', place: 'Rosario', year: '2024' }]);
    });

    it('tolerates settings without exhibitions or print info', async () => {
      const settings = await repositoryWith({ settings: aSettingsWithoutOptionals() }).getSettings('es');

      expect(settings.exhibitions).toEqual([]);
      expect(settings.printInfo).toEqual([]);
    });
  });

  describe('brands', () => {
    it('reflects the new price when Lara changes a package', async () => {
      const repository = repositoryWith({ packages: [aSanityPackage({ nombre: 'Esencial', precio: '$ 150.000', destacado: true })] });

      const brands = await repository.getBrands('es');

      expect(brands.packages).toEqual([{ name: 'Esencial', price: '$ 150.000', items: ['Hasta 10 productos'], featured: true, order: 0 }]);
    });

    it('keeps the editor order of packages and defaults to not featured', async () => {
      const repository = repositoryWith({
        packages: [aSanityPackage({ nombre: 'Esencial' }), aSanityPackage({ nombre: 'Completo', orden: 2 })],
      });

      const brands = await repository.getBrands('es');

      expect(brands.packages.map((pack) => [pack.name, pack.order, pack.featured])).toEqual([
        ['Esencial', 0, false],
        ['Completo', 1, false],
      ]);
    });

    it('builds before and after photos from the two uploaded images', async () => {
      const brands = await repositoryWith().getBrands('es');

      expect(brands.beforeAfter).toHaveLength(1);
      expect(brands.beforeAfter[0]).toMatchObject({ alt: 'Sérum facial sobre agua lila, antes y después del retoque', provisional: true });
      expect(brands.beforeAfter[0]?.before).toMatchObject({ id: 'antesDespues-serum-antes', facet: 'marcas', asset: { provider: 'sanity' } });
      expect(brands.beforeAfter[0]?.after.id).toBe('antesDespues-serum-despues');
    });

    it('marks a final before and after pair as not provisional', async () => {
      const repository = repositoryWith({ beforeAfter: [aSanityBeforeAfter({ provisorio: null })] });

      const brands = await repository.getBrands('es');

      expect(brands.beforeAfter[0]?.provisional).toBe(false);
    });

    it('localizes packages, sectors and before and after descriptions', async () => {
      const repository = repositoryWith({
        packages: [aSanityPackage({ nombre: { es: 'Esencial', en: 'Essential' }, items: { es: ['Hasta 10 productos'], en: ['Up to 10 products'] } })],
        beforeAfter: [aSanityBeforeAfter({ alt: { es: 'Sérum facial sobre agua lila', en: 'Face serum on lilac water' } })],
        brands: aSanityBrands({
          rubros: [{ titulo: { es: 'Gastronomía', en: 'Food' }, descripcion: { es: 'Platos y cartas.' }, foto: aSanityPhoto({ facets: ['marcas'] }) }],
        }),
      });

      const brands = await repository.getBrands('en');

      expect(brands.packages[0]).toMatchObject({ name: 'Essential', items: ['Up to 10 products'] });
      expect(brands.beforeAfter[0]).toMatchObject({ alt: 'Face serum on lilac water', before: { alt: 'Face serum on lilac water' } });
      expect(brands.sectors[0]).toMatchObject({ title: 'Food', description: 'Platos y cartas.' });
    });

    it('marks the brands page as translated only when its sectors title and before and after lead are', async () => {
      const repository = repositoryWith({
        brands: aSanityBrands({ rubrosTitulo: { es: 'Rubros', en: 'Sectors', pt: 'Setores' }, antesDespuesBajada: { es: 'Arrastrá.', en: 'Drag.' } }),
      });

      const brands = await repository.getBrands('es');

      expect(brands.translations).toEqual({ es: true, en: true, pt: false });
    });

    it('maps sectors, process and titles', async () => {
      const brands = await repositoryWith().getBrands('es');

      expect(brands.sectors[0]).toMatchObject({ title: 'Gastronomía', description: 'Platos y cartas.' });
      expect(brands.steps).toEqual([{ title: 'Brief', description: 'Me contás tu marca.' }]);
      expect(brands.beforeAfterTitle[1]).toEqual({ text: 'retoque', italic: true });
      expect(brands.headerCta).toBe('Pedir presupuesto');
      expect(brands.packagesCta).toBe('Elegir este paquete');
    });
  });

  describe('series', () => {
    it('maps layouts from Spanish to English and ignores unknown layouts and empty photos', async () => {
      const [series] = await repositoryWith().getSeries('es');

      expect(series?.photos.map((entry) => [entry.photo.id, entry.layout])).toEqual([
        ['au01', 'center'],
        ['au13', 'bleed'],
      ]);
    });

    it('skips a series photo whose image is still missing', async () => {
      const unfinished = aSanityPhoto({ id: 'foto-sin-imagen', image: { asset: null } as unknown as SanityPhotoDocument['image'] });
      const repository = repositoryWith({ series: [aSanitySeries({ fotos: [{ layout: 'centro', foto: unfinished }] })] });

      const [series] = await repository.getSeries('es');

      expect(series?.photos).toEqual([]);
    });

    it('maps the curatorial data and the display title with an italic word', async () => {
      const [series] = await repositoryWith().getSeries('es');

      expect(series).toMatchObject({ number: 'I', slug: 'oficios', title: 'Oficios', years: '[AÑOS]', curatorialLine: 'Gente trabajando.' });
      expect(series?.displayTitle).toEqual([
        { text: 'Ofi', italic: false },
        { text: 'cios', italic: true },
      ]);
    });

    it('shows each untranslated field in Spanish on its own', async () => {
      const series = aSanitySeries({ titulo: { es: 'Oficios', en: 'Trades' }, textoCuratorial: { es: 'Texto largo' } });

      const [result] = await repositoryWith({ series: [series] }).getSeries('en');

      expect(result?.title).toBe('Trades');
      expect(result?.curatorialText).toBe('Texto largo');
    });

    it('falls back to the Spanish slug and exposes all slugs', async () => {
      const series = aSanitySeries({ slug: { es: { current: 'oficios' }, en: { current: 'trades' } } });

      const [result] = await repositoryWith({ series: [series] }).getSeries('pt');

      expect(result?.slug).toBe('oficios');
      expect(result?.slugs).toEqual({ es: 'oficios', en: 'trades', pt: 'oficios' });
    });

    it('keeps the slug of a series saved before the migration in every language', async () => {
      const series = aSanitySeries({ slug: { current: 'oficios' } });

      const [result] = await repositoryWith({ series: [series] }).getSeries('en');

      expect(result?.slugs).toEqual({ es: 'oficios', en: 'oficios', pt: 'oficios' });
    });

    it('leaves the slug empty while Lara has not generated it', async () => {
      const [result] = await repositoryWith({ series: [aSanitySeries({ slug: null })] }).getSeries('es');

      expect(result?.slug).toBe('');
    });

    it('marks a series as translated only in the languages that have its main fields', async () => {
      const series = aSanitySeries({ titulo: { es: 'Oficios', en: 'Trades', pt: 'Ofícios' }, textoCuratorial: { es: 'Texto', en: 'Text' } });

      const [result] = await repositoryWith({ series: [series] }).getSeries('es');

      expect(result?.translations).toEqual({ es: true, en: true, pt: false });
    });

    it('returns an empty series while Lara has not added photos yet', async () => {
      const repository = repositoryWith({ series: [aSanitySeries({ fotos: null })] });

      const [series] = await repository.getSeries('es');

      expect(series?.photos).toEqual([]);
    });
  });

  describe('prints', () => {
    it('hides a print whose photo has no image yet', async () => {
      const unfinished = aSanityPhoto({ image: { asset: null } as unknown as SanityPhotoDocument['image'] });
      const repository = repositoryWith({ prints: [aSanityPrint({ foto: unfinished })] });

      expect(await repository.getPrints('es')).toEqual([]);
    });

    it('maps edition, sizes and the series of a print', async () => {
      const [print] = await repositoryWith().getPrints('es');

      expect(print).toMatchObject({
        id: 'copia-au03',
        edition: 10,
        available: null,
        active: true,
        sizes: [{ size: '30 × 40 cm', price: '[PRECIO]' }],
        series: { number: 'I', slug: 'oficios', title: 'Oficios' },
      });
    });

    it('flags a deactivated print so the shop does not list it', async () => {
      const repository = repositoryWith({ prints: [aSanityPrint({ activa: false, disponibles: 3 })] });

      const [print] = await repository.getPrints('es');

      expect(print).toMatchObject({ active: false, available: 3 });
    });

    it('treats a print without the active flag or sizes as hidden and empty', async () => {
      const repository = repositoryWith({ prints: [aSanityPrint({ activa: null, tamanos: null })] });

      const [print] = await repository.getPrints('es');

      expect(print).toMatchObject({ active: false, sizes: [] });
    });

    it('maps the prints page with the shared print info from the settings', async () => {
      const content = await repositoryWith().getPrintsContent('es');

      expect(content.title[1]).toEqual({ text: 'de autor', italic: true });
      expect(content.editionLabel).toBe('Edición de {edicion} · quedan {disponibles}');
      expect(content.info).toEqual([{ title: 'Impresión', description: '[Papel y técnica de impresión]' }]);
    });

    it('names the series of a print in the visitor language', async () => {
      const serie = { numero: 'I', slug: { es: { current: 'oficios' }, en: { current: 'trades' } }, titulo: { es: 'Oficios', en: 'Trades' } };
      const repository = repositoryWith({ prints: [aSanityPrint({ serie })] });

      const [print] = await repository.getPrints('en');

      expect(print?.series).toEqual({ number: 'I', slug: 'trades', title: 'Trades' });
    });

    it('localizes the prints page and marks it translated by its title and lead', async () => {
      const repository = repositoryWith({
        printsPage: aSanityPrintsPage({
          titulo: { es: aSanityTitle(['Copias '], ['de autor', true]), en: aSanityTitle(['Fine art '], ['prints', true]) },
          bajada: { es: 'Fotografías en ediciones limitadas.', en: 'Limited edition photographs.' },
          info: [{ titulo: { es: 'Impresión', en: 'Printing' }, descripcion: { es: '[Papel y técnica de impresión]' } }],
        }),
      });

      const content = await repository.getPrintsContent('en');

      expect(content.title[1]).toEqual({ text: 'prints', italic: true });
      expect(content.lead).toBe('Limited edition photographs.');
      expect(content.info).toEqual([{ title: 'Printing', description: '[Papel y técnica de impresión]' }]);
      expect(content.translations).toEqual({ es: true, en: true, pt: false });
    });

    it('tolerates a prints page without info', async () => {
      const content = await repositoryWith({ printsPage: aSanityPrintsPage({ info: null }) }).getPrintsContent('es');

      expect(content.info).toEqual([]);
    });
  });

  describe('texts', () => {
    it('uses default texts when the site texts document does not exist', async () => {
      expect(await repositoryWith({ siteTexts: null }).getTexts('en')).toEqual(defaultSiteTexts.en);
    });

    it('applies Lara overrides to site texts', async () => {
      const repository = repositoryWith({ siteTexts: aSanitySiteTexts({ nav: { bookSession: { en: 'Book now' } } }) });

      expect((await repository.getTexts('en')).nav.bookSession).toBe('Book now');
    });
  });

  describe('caching', () => {
    it('fetches each document once for all languages', async () => {
      const client = aSanityClient();
      const repository = new SanityContentRepository(new CachedSanityClient(client));

      await Promise.all(locales.map((locale) => repository.getHome(locale)));

      expect(client.requests.filter((query) => query === homeQuery)).toHaveLength(1);
    });
  });

  describe('obra', () => {
    it('shows the first three active prints in the teaser and skips the deactivated ones', async () => {
      const prints = [
        aSanityPrint({ id: 'copia-1', foto: aSanityPhoto({ id: 'foto-au01', facets: [] }), activa: false }),
        aSanityPrint({ id: 'copia-2', foto: aSanityPhoto({ id: 'foto-au02', facets: [] }) }),
        aSanityPrint({ id: 'copia-3', foto: aSanityPhoto({ id: 'foto-au03', facets: [] }) }),
        aSanityPrint({ id: 'copia-4', foto: aSanityPhoto({ id: 'foto-au04', facets: [] }) }),
        aSanityPrint({ id: 'copia-5', foto: aSanityPhoto({ id: 'foto-au05', facets: [] }) }),
      ];

      const obra = await repositoryWith({ prints }).getObra('es');

      expect(obra.printsTeaser.photos.map((photo) => photo.id)).toEqual(['au02', 'au03', 'au04']);
    });

    it('maps the opening, quote and bands', async () => {
      const obra = await repositoryWith().getObra('es');

      expect(obra.opening).toMatchObject({ seriesNumber: 'I', seriesTitle: 'Oficios' });
      expect(obra.opening.caption[0]).toEqual({ text: 'Sin título', italic: true });
      expect(obra.quote).toBe('Una bitácora de mi trabajo.');
      expect(obra.seriesPrintsBand.cta).toBe('Ver copias');
      expect(obra.exhibitionsTitle).toBe('Muestras y publicaciones');
    });

    it('localizes the obra page and marks it translated by its quote and about title', async () => {
      const repository = repositoryWith({
        obra: aSanityObra({
          frase: { es: 'Una bitácora de mi trabajo.', en: 'A logbook of my work.' },
          sobreTitulo: { es: aSanityTitle(['Sobre la '], ['obra', true]), en: aSanityTitle(['About the '], ['work', true]) },
        }),
      });

      const obra = await repository.getObra('en');

      expect(obra.quote).toBe('A logbook of my work.');
      expect(obra.aboutTitle[1]).toEqual({ text: 'work', italic: true });
      expect(obra.seriesTitle).toBe('Series');
      expect(obra.translations).toEqual({ es: true, en: true, pt: false });
    });

    it('explains which document is missing when the obra page does not exist', async () => {
      await expect(repositoryWith({ obra: null }).getObra('es')).rejects.toThrow('paginaObra');
    });
  });

  describe('booking offers', () => {
    it('maps a priced session from pesos to cents with its deposit percentage', async () => {
      const offers = await repositoryWith().getBookingOffers('es');

      expect(offers).toEqual([
        {
          slug: 'maternidad',
          title: 'Maternidad',
          description: 'La espera, en clave íntima y sin apuro.',
          facet: 'retratos',
          priceCents: 9_500_000,
          depositPercent: 50,
          durationMinutes: 90,
          order: 2,
          translations: { es: true, en: false, pt: false },
        },
      ]);
    });

    it('shows the title and description in the visitor language and marks the language as translated', async () => {
      const repository = repositoryWith({
        bookingOffers: [
          aSanityBookingOffer({
            titulo: { es: 'Maternidad', en: 'Maternity', pt: 'Maternidade' },
            descripcion: { es: 'La espera.', en: 'The wait.', pt: 'A espera.' },
          }),
        ],
      });

      const [offer] = await repository.getBookingOffers('en');

      expect(offer).toMatchObject({ title: 'Maternity', description: 'The wait.', translations: { es: true, en: true, pt: true } });
    });

    it('falls back to Spanish for the language Lara has not translated yet', async () => {
      const repository = repositoryWith({
        bookingOffers: [aSanityBookingOffer({ titulo: { es: 'Maternidad', en: 'Maternity' }, descripcion: { es: 'La espera.' } })],
      });

      const [offer] = await repository.getBookingOffers('en');

      expect(offer).toMatchObject({ title: 'Maternity', description: 'La espera.', translations: { es: true, en: false, pt: false } });
    });

    it('keeps a session without price as not bookable', async () => {
      const repository = repositoryWith({ bookingOffers: [aSanityBookingOffer({ precio: null })] });

      const [offer] = await repository.getBookingOffers('es');

      expect(offer?.priceCents).toBeNull();
    });

    it('treats a missing or zero duration as a session booked by proposed date', async () => {
      const repository = repositoryWith({
        bookingOffers: [aSanityBookingOffer({ duracionMinutos: null }), aSanityBookingOffer({ slug: 'cero', duracionMinutos: 0 })],
      });

      const offers = await repository.getBookingOffers('es');

      expect(offers.map((offer) => offer.durationMinutes)).toEqual([null, null]);
    });

    it('treats a price of zero as no price', async () => {
      const repository = repositoryWith({ bookingOffers: [aSanityBookingOffer({ precio: 0 })] });

      const [offer] = await repository.getBookingOffers('es');

      expect(offer?.priceCents).toBeNull();
    });

    it('falls back to a half deposit, empty description and first position when Lara left them empty', async () => {
      const repository = repositoryWith({ bookingOffers: [aSanityBookingOffer({ porcentajeSena: null, descripcion: null, orden: null })] });

      const [offer] = await repository.getBookingOffers('es');

      expect(offer).toMatchObject({ depositPercent: 50, description: '', order: 0 });
    });

    it('rounds a price with centavos to whole cents', async () => {
      const repository = repositoryWith({ bookingOffers: [aSanityBookingOffer({ precio: 85000.555 })] });

      const [offer] = await repository.getBookingOffers('es');

      expect(offer?.priceCents).toBe(8_500_056);
    });

    it('skips a session whose facet is missing, unknown or deleted', async () => {
      const repository = repositoryWith({
        bookingOffers: [
          aSanityBookingOffer({ slug: 'sin-faceta', faceta: null }),
          aSanityBookingOffer({ slug: 'faceta-vieja', faceta: 'bodas' }),
          aSanityBookingOffer({ slug: 'familias' }),
        ],
      });

      const offers = await repository.getBookingOffers('es');

      expect(offers.map((offer) => offer.slug)).toEqual(['familias']);
    });
  });

  describe('scheduling settings', () => {
    it('uses the defaults when Lara has not opened the agenda document yet', async () => {
      expect(await repositoryWith().getSchedulingSettings()).toEqual({
        timeZone: 'America/Argentina/Buenos_Aires',
        windows: [],
        slotStepMinutes: 30,
        bufferMinutes: 30,
        minNoticeHours: 48,
        horizonDays: 90,
        holdMinutes: 30,
      });
    });

    it('maps the weekly windows and the numbers Lara chose', async () => {
      const repository = repositoryWith({
        scheduling: {
          ventanas: [
            { dia: 2, desde: '10:00', hasta: '13:00' },
            { dia: 6, desde: '09:00', hasta: '13:00' },
          ],
          pasoMinutos: 60,
          margenMinutos: 15,
          anticipacionHoras: 24,
          horizonteDias: 30,
          retencionMinutos: 20,
          zonaHoraria: 'America/Argentina/Cordoba',
        },
      });

      expect(await repository.getSchedulingSettings()).toEqual({
        timeZone: 'America/Argentina/Cordoba',
        windows: [
          { weekday: 2, from: '10:00', to: '13:00' },
          { weekday: 6, from: '09:00', to: '13:00' },
        ],
        slotStepMinutes: 60,
        bufferMinutes: 15,
        minNoticeHours: 24,
        horizonDays: 30,
        holdMinutes: 20,
      });
    });

    it('falls back to defaults for numbers left empty and ignores a document without windows', async () => {
      const repository = repositoryWith({
        scheduling: { ventanas: null, pasoMinutos: null, margenMinutos: null, anticipacionHoras: null, horizonteDias: null, retencionMinutos: null, zonaHoraria: null },
      });

      expect((await repository.getSchedulingSettings()).windows).toEqual([]);
      expect((await repository.getSchedulingSettings()).holdMinutes).toBe(30);
    });

    it('drops incomplete or impossible windows instead of breaking the agenda', async () => {
      const repository = repositoryWith({
        scheduling: {
          ventanas: [
            { dia: 8, desde: '10:00', hasta: '13:00' },
            { dia: 0, desde: '10:00', hasta: '13:00' },
            { dia: 2.5, desde: '10:00', hasta: '13:00' },
            { dia: null, desde: '10:00', hasta: '13:00' },
            { dia: 2, desde: null, hasta: '13:00' },
            { dia: 2, desde: '10:00', hasta: null },
            { dia: 2, desde: '25:00', hasta: '26:00' },
            { dia: 2, desde: '13:00', hasta: '10:00' },
            { dia: 7, desde: '10:00', hasta: '12:00' },
          ],
        },
      });

      expect((await repository.getSchedulingSettings()).windows).toEqual([{ weekday: 7, from: '10:00', to: '12:00' }]);
    });
  });
});

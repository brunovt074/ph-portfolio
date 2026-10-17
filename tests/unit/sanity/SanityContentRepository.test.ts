import { describe, expect, it } from 'vitest';
import type { SanityPhotoDocument } from '@/infrastructure/sanity/documents/SanityPhotoDocument';
import { defaultSiteTexts } from '@/infrastructure/texts/defaults/defaultSiteTexts';
import { SanityContentRepository } from '@/infrastructure/sanity/SanityContentRepository';
import { SanityDocumentNotFoundError } from '@/infrastructure/sanity/SanityDocumentNotFoundError';
import { aBareSanityImage, aSanityPhoto } from '../../fixtures/sanity/aSanityPhoto';
import { aSanityBeforeAfter, aSanityPackage } from '../../fixtures/sanity/aSanityBrands';
import { aSanityFacet } from '../../fixtures/sanity/aSanityFacet';
import { aSanityHome } from '../../fixtures/sanity/aSanityHome';
import { aSanityPrint, aSanityPrintsPage, aSanitySeries } from '../../fixtures/sanity/aSanityObra';
import { aSettingsWithoutOptionals } from '../../fixtures/sanity/aSanitySettings';
import { aSanityTitle } from '../../fixtures/sanity/aSanityTitle';
import { aSanityClient } from '../../fixtures/sanity/aSanityWorld';

const repositoryWith = (overrides: Parameters<typeof aSanityClient>[0] = {}) =>
  new SanityContentRepository(aSanityClient(overrides));

describe('SanityContentRepository', () => {
  describe('photos', () => {
    it('maps a photo with hotspot, lqip and dimensions so the image pipeline can crop it', async () => {
      const [facet] = await repositoryWith().getFacets();

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

    it('centers a photo that Sarah never gave a hotspot', async () => {
      const photo = aSanityPhoto({ image: aBareSanityImage(), destacada: null, facets: null });
      const repository = repositoryWith({ facets: [aSanityFacet({ galeria: [photo] })] });

      const [facet] = await repository.getFacets();

      expect(facet?.gallery[0]?.asset).toEqual({ provider: 'sanity', ref: 'image-bare-800x600-jpg' });
      expect(facet?.gallery[0]?.facet).toBe('obra');
      expect(facet?.gallery[0]?.featured).toBe(false);
    });

    it('keeps title, place and year of a series photo', async () => {
      const photo = aSanityPhoto({ titulo: 'Bidones', tituloProvisorio: true, lugar: 'Rosario', anio: 2024, facets: [] });
      const repository = repositoryWith({ facets: [aSanityFacet({ galeria: [photo] })] });

      const [facet] = await repository.getFacets();

      expect(facet?.gallery[0]).toMatchObject({ title: 'Bidones', provisionalTitle: true, place: 'Rosario', year: 2024 });
    });

    it('skips a gallery reference that points to a deleted photo', async () => {
      const [facet] = await repositoryWith().getFacets();

      expect(facet?.cover).toHaveLength(1);
    });

    it('skips a photo whose image Sarah has not uploaded yet', async () => {
      const unfinished = aSanityPhoto({ id: 'foto-sin-imagen', image: { asset: null } as unknown as SanityPhotoDocument['image'] });
      const repository = repositoryWith({ facets: [aSanityFacet({ galeria: [unfinished, aSanityPhoto({ id: 'foto-rt01' })] })] });

      const [facet] = await repository.getFacets();

      expect(facet?.gallery.map((photo) => photo.id)).toEqual(['rt01']);
    });

    it('treats a missing gallery as empty', async () => {
      const repository = repositoryWith({ facets: [aSanityFacet({ portada: null, galeria: null })] });

      const [facet] = await repository.getFacets();

      expect(facet?.cover).toEqual([]);
      expect(facet?.gallery).toEqual([]);
    });
  });

  describe('facets', () => {
    it('turns a title with an italic word into segments', async () => {
      const [facet] = await repositoryWith().getFacets();

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

      const [facet] = await repository.getFacets();

      expect(facet?.title).toEqual([{ text: 'Solo itálica', italic: true }]);
    });

    it('maps services and omits the prices Sarah left blank', async () => {
      const [facet] = await repositoryWith().getFacets();

      expect(facet?.services).toEqual([
        { title: 'Retrato personal', description: 'Una sesión para vos.', price: '[PRECIO]' },
        { title: 'Marca personal' },
      ]);
    });

    it('discards a facet whose slug the site does not know', async () => {
      const repository = repositoryWith({ facets: [aSanityFacet({ slug: 'bodas' }), aSanityFacet({ slug: 'eventos' })] });

      const facets = await repository.getFacets();

      expect(facets.map((facet) => facet.slug)).toEqual(['eventos']);
    });

    it('maps the facet texts and omits the optional quote', async () => {
      const repository = repositoryWith({ facets: [aSanityFacet({ quote: null, servicios: null })] });

      const [facet] = await repository.getFacets();

      expect(facet).toMatchObject({ slug: 'retratos', number: 2, name: 'Retratos & Estudio', ctaText: 'Reservá tu sesión', ctaButton: 'Reservar sesión', services: [] });
      expect(facet).not.toHaveProperty('quote');
    });
  });

  describe('home', () => {
    it('maps both doors with their destinations', async () => {
      const home = await repositoryWith().getHome();

      expect(home.encargosDoor).toMatchObject({ href: '/#encargos', label: 'Puerta 1', subtitle: 'Editorial · Retratos · Marcas · Eventos' });
      expect(home.obraDoor).toMatchObject({ href: '/obra', title: [{ text: 'Obra', italic: true }] });
    });

    it('maps thumbnails, strips, services and contact texts', async () => {
      const home = await repositoryWith().getHome();

      expect(home.facetThumbnails.retratos[0]?.id).toBe('rt02');
      expect(home.facetThumbnails.eventos[0]?.facet).toBe('eventos');
      expect(home.editorialStrip).toHaveLength(1);
      expect(home.brandServices).toEqual([{ title: 'Gastronomía', price: 'desde [PRECIO]' }]);
      expect(home.workTypes).toEqual(['Editorial & moda', 'Copia de autor']);
      expect(home.contactTitle).toBe('Hablemos.');
    });

    it('tolerates a home without brand services', async () => {
      const home = await repositoryWith({ home: aSanityHome({ marcasServicios: null }) }).getHome();

      expect(home.brandServices).toEqual([]);
    });

    it('explains which document is missing when Sarah has not created the home yet', async () => {
      const repository = repositoryWith({ home: null });

      await expect(repository.getHome()).rejects.toThrow(SanityDocumentNotFoundError);
      await expect(repository.getHome()).rejects.toThrow('paginaInicio');
    });
  });

  describe('settings', () => {
    it('builds the portrait photo and the contact data', async () => {
      const settings = await repositoryWith().getSettings();

      expect(settings.portrait).toMatchObject({ id: 'retrato-sarah', facet: 'retratos', alt: 'Sarah Moreau con su cámara, en blanco y negro' });
      expect(settings.exhibitions).toEqual([{ title: '[Muestra o publicación]', place: '[Lugar]', year: '[AÑO]' }]);
      expect(settings.printInfo).toEqual([{ title: 'Envío', description: '[Zonas y tiempos de envío]' }]);
      expect(settings.quote).toBe('Cada fotografía es un registro de nuestro paso.');
    });

    it('tolerates settings without exhibitions or print info', async () => {
      const settings = await repositoryWith({ settings: aSettingsWithoutOptionals() }).getSettings();

      expect(settings.exhibitions).toEqual([]);
      expect(settings.printInfo).toEqual([]);
    });
  });

  describe('brands', () => {
    it('reflects the new price when Sarah changes a package', async () => {
      const repository = repositoryWith({ packages: [aSanityPackage({ nombre: 'Esencial', precio: '$ 150.000', destacado: true })] });

      const brands = await repository.getBrands();

      expect(brands.packages).toEqual([{ name: 'Esencial', price: '$ 150.000', items: ['Hasta 10 productos'], featured: true, order: 0 }]);
    });

    it('keeps the editor order of packages and defaults to not featured', async () => {
      const repository = repositoryWith({
        packages: [aSanityPackage({ nombre: 'Esencial' }), aSanityPackage({ nombre: 'Completo', orden: 2 })],
      });

      const brands = await repository.getBrands();

      expect(brands.packages.map((pack) => [pack.name, pack.order, pack.featured])).toEqual([
        ['Esencial', 0, false],
        ['Completo', 1, false],
      ]);
    });

    it('builds before and after photos from the two uploaded images', async () => {
      const brands = await repositoryWith().getBrands();

      expect(brands.beforeAfter).toHaveLength(1);
      expect(brands.beforeAfter[0]).toMatchObject({ alt: 'Sérum facial sobre agua lila, antes y después del retoque', provisional: true });
      expect(brands.beforeAfter[0]?.before).toMatchObject({ id: 'antesDespues-serum-antes', facet: 'marcas', asset: { provider: 'sanity' } });
      expect(brands.beforeAfter[0]?.after.id).toBe('antesDespues-serum-despues');
    });

    it('marks a final before and after pair as not provisional', async () => {
      const repository = repositoryWith({ beforeAfter: [aSanityBeforeAfter({ provisorio: null })] });

      const brands = await repository.getBrands();

      expect(brands.beforeAfter[0]?.provisional).toBe(false);
    });

    it('maps sectors, process and titles', async () => {
      const brands = await repositoryWith().getBrands();

      expect(brands.sectors[0]).toMatchObject({ title: 'Gastronomía', description: 'Platos y cartas.' });
      expect(brands.steps).toEqual([{ title: 'Brief', description: 'Me contás tu marca.' }]);
      expect(brands.beforeAfterTitle[1]).toEqual({ text: 'retoque', italic: true });
      expect(brands.headerCta).toBe('Pedir presupuesto');
      expect(brands.packagesCta).toBe('Elegir este paquete');
    });
  });

  describe('series', () => {
    it('maps layouts from Spanish to English and ignores unknown layouts and empty photos', async () => {
      const [series] = await repositoryWith().getSeries();

      expect(series?.photos.map((entry) => [entry.photo.id, entry.layout])).toEqual([
        ['au01', 'center'],
        ['au13', 'bleed'],
      ]);
    });

    it('skips a series photo whose image is still missing', async () => {
      const unfinished = aSanityPhoto({ id: 'foto-sin-imagen', image: { asset: null } as unknown as SanityPhotoDocument['image'] });
      const repository = repositoryWith({ series: [aSanitySeries({ fotos: [{ layout: 'centro', foto: unfinished }] })] });

      const [series] = await repository.getSeries();

      expect(series?.photos).toEqual([]);
    });

    it('maps the curatorial data and the display title with an italic word', async () => {
      const [series] = await repositoryWith().getSeries();

      expect(series).toMatchObject({ number: 'I', slug: 'oficios', title: 'Oficios', years: '[AÑOS]', curatorialLine: 'Gente trabajando.' });
      expect(series?.displayTitle).toEqual([
        { text: 'Ofi', italic: false },
        { text: 'cios', italic: true },
      ]);
    });

    it('returns an empty series while Sarah has not added photos yet', async () => {
      const repository = repositoryWith({ series: [aSanitySeries({ fotos: null })] });

      const [series] = await repository.getSeries();

      expect(series?.photos).toEqual([]);
    });
  });

  describe('prints', () => {
    it('hides a print whose photo has no image yet', async () => {
      const unfinished = aSanityPhoto({ image: { asset: null } as unknown as SanityPhotoDocument['image'] });
      const repository = repositoryWith({ prints: [aSanityPrint({ foto: unfinished })] });

      expect(await repository.getPrints()).toEqual([]);
    });

    it('maps edition, sizes and the series of a print', async () => {
      const [print] = await repositoryWith().getPrints();

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

      const [print] = await repository.getPrints();

      expect(print).toMatchObject({ active: false, available: 3 });
    });

    it('treats a print without the active flag or sizes as hidden and empty', async () => {
      const repository = repositoryWith({ prints: [aSanityPrint({ activa: null, tamanos: null })] });

      const [print] = await repository.getPrints();

      expect(print).toMatchObject({ active: false, sizes: [] });
    });

    it('maps the prints page with the shared print info from the settings', async () => {
      const content = await repositoryWith().getPrintsContent();

      expect(content.title[1]).toEqual({ text: 'de autor', italic: true });
      expect(content.editionLabel).toBe('Edición de {edicion} · quedan {disponibles}');
      expect(content.info).toEqual([{ title: 'Impresión', description: '[Papel y técnica de impresión]' }]);
    });

    it('tolerates a prints page without info', async () => {
      const content = await repositoryWith({ printsPage: aSanityPrintsPage({ info: null }) }).getPrintsContent();

      expect(content.info).toEqual([]);
    });
  });

  describe('texts', () => {
    it('serves the default interface texts of the requested language', async () => {
      expect(await repositoryWith().getTexts('en')).toBe(defaultSiteTexts.en);
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

      const obra = await repositoryWith({ prints }).getObra();

      expect(obra.printsTeaser.photos.map((photo) => photo.id)).toEqual(['au02', 'au03', 'au04']);
    });

    it('maps the opening, quote and bands', async () => {
      const obra = await repositoryWith().getObra();

      expect(obra.opening).toMatchObject({ seriesNumber: 'I', seriesTitle: 'Oficios' });
      expect(obra.opening.caption[0]).toEqual({ text: 'Sin título', italic: true });
      expect(obra.quote).toBe('Una bitácora de mi trabajo.');
      expect(obra.seriesPrintsBand.cta).toBe('Ver copias');
      expect(obra.exhibitionsTitle).toBe('Muestras y publicaciones');
    });

    it('explains which document is missing when the obra page does not exist', async () => {
      await expect(repositoryWith({ obra: null }).getObra()).rejects.toThrow('paginaObra');
    });
  });
});

# i18n y textos editables — Plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: usar superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan checkboxes (`- [x]`).

**Goal:** El sitio se publica en español, inglés y portugués con URLs traducidas, y Sarah puede editar desde `/admin` tanto el contenido de cada idioma como todos los textos fijos de la interfaz.

**Architecture:** El idioma (`Locale`) y el mapa de rutas traducidas viven en `src/domain` como funciones puras. `ContentRepository` recibe el idioma en cada método y devuelve contenido ya resuelto (los tipos de dominio siguen siendo `string`); la resolución por idioma con fallback a español ocurre en los mappers de Sanity con `localize()`. Los textos de interfaz son un tipo `SiteTexts` (dos niveles, hojas `string`) con valores por defecto en código para es/en/pt y un singleton `textosDelSitio` en Sanity que los pisa campo por campo. Las páginas se mueven a vistas (`src/views/*View.astro`) que reciben `locale`; las páginas en español siguen en su lugar y una sola ruta dinámica `src/pages/[locale]/[...path].astro` genera en/pt.

**Tech Stack:** Astro 7.4 (estático + `@astrojs/node`), Sanity 6 (Studio en `/admin`), Vitest 5 con cobertura v8, Playwright.

**Spec:** este documento (sección "Decisiones"). Contexto de producto: `CLAUDE.md`, `docs/04-cms.md`, `docs/07-cms-setup.md`.

**Rama:** `feature/i18n-editable-texts`, creada desde `e6e683c` en el worktree `.claude/worktrees/i18n-editable-texts`. Corre en paralelo con `feature/bookings-payments` (tiene cambios sin commitear en `src/domain/ContentRepository.ts`) y con otro agente que trabaja en URLs: esperar conflictos en `ContentRepository.ts`, `astro.config.mjs` y `src/pages/**`; se resuelven al integrar.

---

## Decisiones

| Tema | Decisión |
|---|---|
| Idiomas | `es` (por defecto), `en`, `pt`. Etiquetas HTML: `es-AR`, `en`, `pt-BR`. `og:locale`: `es_AR`, `en_US`, `pt_BR`. |
| URLs | Español sin prefijo (las URLs actuales no cambian). en/pt con prefijo y segmentos traducidos (tabla abajo). Mejor SEO que repetir los slugs en español. |
| Slugs de series | Campo localizado en Sanity (`es` obligatorio, `en`/`pt` opcionales, fallback al de `es`). |
| Segmentos de página | Fijos en código (`routeSegments`). Cambiar una URL rompe SEO; no se edita desde el admin. |
| Contenido del CMS | Traducible por campo (`{ es, en, pt }`) en los mismos documentos. Fotos, precios numéricos, órdenes y referencias se comparten entre idiomas. Sin plugin de document-internationalization: no duplica documentos ni fotos. |
| Fallback de contenido | `valor[locale]` → `valor.es`. Vacío (`''`, `[]`, espacios) cuenta como faltante. El español es el único idioma que siempre está completo. |
| Páginas sin traducir (SEO) | Cada contenido de página expone `translations: Record<Locale, boolean>` (es siempre `true`; en/pt `true` si sus campos principales están en ese idioma). Página en/pt sin traducir: se genera igual (el selector nunca da 404), con `noindex`, canonical a la versión es, sin `hreflang` y fuera del sitemap. |
| `hreflang` | Solo los idiomas con `translations[locale] === true`. `x-default` = versión en si está traducida, si no la es. |
| Detección de idioma | Sin redirecciones por `Accept-Language` ni por IP: la URL define el idioma y el visitante cambia con el selector. Googlebot rastrea sin `Accept-Language` y una redirección automática le esconde las otras versiones. |
| Sitemap | Endpoint propio `src/pages/sitemap.xml.ts` (reemplaza a `@astrojs/sitemap`): lista solo páginas indexables, con `xhtml:link` alternates por idioma. |
| Textos de interfaz | Tipo `SiteTexts`; defaults en código por idioma; override en el singleton `textosDelSitio`. Fallback: `cms[locale]` → `default[locale]` (nunca al español del CMS, porque el default en inglés es mejor que un texto en español). |
| Singleton ausente | Si `textosDelSitio` no existe, se usan los defaults (no se lanza error, a diferencia del resto de los singletons). |
| Modo semilla | `SeedContentRepository` ignora el idioma para el contenido (devuelve español) y devuelve los defaults de `SiteTexts` del idioma pedido. |
| Interpolación | Plantillas con `{nombre}` resueltas por `formatText`. Placeholder desconocido o faltante se deja tal cual. |
| Astro i18n | No se activa `i18n` en `astro.config.mjs`: con slugs traducidos su routing no ayuda. Hreflang, `lang`, canonical y sitemap se generan a mano. |
| Formulario | Mensajes de error resueltos en el cliente (JS) o en `/contacto/error` (sin JS) a partir de códigos de campo. El mail a Sarah sigue en español y agrega `Idioma: …`. |
| 404 | Única, en español, con enlaces a `/en/` y `/pt/`. |
| Studio | Sigue en español. Cada campo localizado muestra Español arriba y "Inglés y portugués" en un grupo colapsable. |

### Segmentos de ruta

| `RouteKey` | es | en | pt |
|---|---|---|---|
| `home` | `/` | `/en/` | `/pt/` |
| `editorial` | `/editorial` | `/en/editorial` | `/pt/editorial` |
| `retratos` | `/retratos` | `/en/portraits` | `/pt/retratos` |
| `marcas` | `/marcas` | `/en/brands` | `/pt/marcas` |
| `eventos` | `/eventos` | `/en/events` | `/pt/eventos` |
| `obra` | `/obra` | `/en/work` | `/pt/obra` |
| `copias` | `/obra/copias` | `/en/work/prints` | `/pt/obra/copias` |
| `serie` | `/obra/{slug}` | `/en/work/{slug}` | `/pt/obra/{slug}` |
| `reservas` | `/reservas` | `/en/bookings` | `/pt/reservas` |

La página y la vista de `reservas` las crea `feature/bookings-payments` (ver "Coordinación"). Esta rama solo agrega la clave y sus segmentos.

### Coordinación con `feature/bookings-payments`

- Esa rama construye su interfaz sobre las Tareas 1 y 2 de esta (hace merge cuando estén commiteadas) y sigue estos patrones.
- **Rutas:** las páginas a demanda de reservas (`/reservas/[id]`, `/reservas/iniciar`, `/reservas/reintentar`, `/reservas/error`, `/reservas/simulador/[checkoutId]`) quedan solo en español y se arman con `pathTo`. `/api/**` no se localiza.
- **`ContentRepository`:** `getBookingOffers(locale)` recibe idioma y su mapper usa `localize()`. `getSchedulingSettings()` no recibe idioma. El conflicto lo resuelve esa rama.
- **`SiteTexts`:** esa rama agrega el grupo `booking` (defaults es/en/pt y sus etiquetas en `siteTextLabels`). `resolveSiteTexts` y `textosDelSitio` lo toman solos porque recorren los grupos.
- **`src/middleware.ts`:** se compone con `sequence()` de `astro:middleware`. Esta rama solo cambia `LIMIT_REDIRECT` del contacto (Tarea 8). El rate limit de reservas va en un middleware aparte de esa rama.
- **SEO de páginas sin traducir:** `ReservasView` pasa `translations` a `BaseLayout` (calculado sobre los campos principales de sus ofertas con `translationsOf`) y suma la ruta `reservas` a `ListSitemapEntries`.
- **Otros archivos compartidos:** `astro.config.mjs` (esa rama solo toca `env.schema`; esta solo quita `@astrojs/sitemap` de `integrations` en la Tarea 7), `sanity/schemaTypes/index.ts` y `deskStructure.ts` (agregados en la misma lista, conflicto trivial).

## Global Constraints

- Sin comentarios en el código. Un archivo por clase/tipo exportado. Sin imports con comodín.
- `src/domain/**` no importa nada de `src/infrastructure`, `astro:*` ni `sanity`.
- Textos de UI y del Studio en español; código, tests y nombres en inglés.
- Tokens de diseño solamente (el selector de idioma usa clases existentes: `t-nav`, `--tap`, `--fg-muted`, `--accent-current`).
- Objetivos táctiles ≥ 44 px (`min-height: var(--tap)`), foco visible, contraste AA.
- 100 % de cobertura (líneas, ramas, funciones) en use cases, repositorios, mappers y en los módulos nuevos que se agregan a `vitest.config.ts`.
- No inventar datos reales (precios, emails, teléfonos). Los defaults en/pt traducen la copia existente; los placeholders `[PRECIO]` quedan igual.
- Nunca commitear sin el OK de Bruno: cada "Handoff" muestra `git status` / `git diff --stat` y el mensaje sugerido, y pide "Dale, hacé vos el commit."
- Verificación de cada tarea: `npm run check && npm test`. Tareas 7–9 además `npm run build` y `npm run test:e2e`.

## Review Focus

1. **Sarah borra un texto del admin** (campo vacío o solo espacios) → se ve el default de ese idioma, nunca un hueco. Test en Tarea 2 (`resolveSiteTexts`).
2. **Traducción a medias** (serie con `titulo.en` pero sin `textoCuratorial.en`) → cada campo cae a español por separado, la página no se rompe. Test en Tarea 5 (`SanityContentRepository`).
3. **Slug de serie que choca con una ruta fija** (`copias`, `prints`) o dos series con el mismo slug en un idioma → el build falla con `DuplicateRouteError` que nombra la ruta, y el Studio lo valida antes de publicar. Tests en Tareas 1 y 3.
4. **Datos viejos de Sanity sin migrar** (campo todavía `string` plano) → `localize()` lo trata como español; el sitio sigue construyendo. Test en Tarea 5.
5. **Visitante en `/en/…` que envía el formulario sin JS o es frenado por el rate limit** → ve la página de resultado en inglés. Tests en Tarea 8 (unit de `localeFromPath`/`parseLocale` + e2e).
6. **Sarah traduce una sola página al inglés** → solo esa página entra al sitemap y a los `hreflang` en inglés; el resto de `/en/…` sigue con `noindex` y canonical a español. Tests en Tareas 5 (`translations`) y 7 (`ListSitemapEntries`, `HreflangLinks`).

---

## Mapa de archivos

**Crear**
- `src/domain/Locale.ts` — `Locale`, `locales`, `defaultLocale`, `isLocale`.
- `src/domain/routing/RouteKey.ts`, `RouteTarget.ts`, `routeSegments.ts`, `pathTo.ts`, `alternatePaths.ts`, `localeFromPath.ts`, `localizedPaths.ts`, `DuplicateRouteError.ts`.
- `src/domain/SiteTexts.ts` — tipo de los textos de interfaz.
- `src/domain/formatText.ts`.
- `src/application/GetSiteTexts.ts`.
- `src/infrastructure/texts/defaults/esTexts.ts`, `enTexts.ts`, `ptTexts.ts`, `defaultSiteTexts.ts`, `resolveSiteTexts.ts`, `SiteTextsOverrides.ts`.
- `src/infrastructure/sanity/mapping/localize.ts`, `documents/SanityLocalized.ts`, `documents/SanitySiteTextsDocument.ts`, `queries/siteTextsQuery.ts`.
- `sanity/schemaTypes/localizados.ts` (tipos `textoLocalizado`, `parrafoLocalizado`, `tituloLocalizado`, `listaLocalizada`, `slugLocalizado`), `sanity/schemaTypes/textosDelSitio.ts`, `sanity/texts/siteTextLabels.ts`, `sanity/validation/reservedSlugs.ts`.
- `migrations/localize-fields/index.ts`.
- `src/views/HomeView.astro`, `EditorialView.astro`, `RetratosView.astro`, `MarcasView.astro`, `EventosView.astro`, `ObraView.astro`, `SeriesView.astro`, `PrintsView.astro`, `views.ts`.
- `src/pages/[locale]/[...path].astro`.
- `src/components/LanguageSwitcher.astro`, `src/components/HreflangLinks.astro`.
- `tests/unit/routing/*.test.ts`, `tests/unit/texts/*.test.ts`, `tests/unit/localize.test.ts`, `tests/unit/GetSiteTexts.test.ts`, `tests/e2e/i18n.spec.ts`, `tests/fixtures/sanity/aSanitySiteTexts.ts`.

**Modificar (principales)**
- `src/domain/ContentRepository.ts` (parámetro `locale` + `getTexts`), `Series.ts` (`slugs`), `ContactMessage.ts` (`locale`).
- Todos los use cases de `src/application/` (reciben `locale`), `locateFacet.ts`.
- `SeedContentRepository.ts`, `SanityContentRepository.ts`, todos los `mapping/to*.ts`, `documents/Sanity*Document.ts`.
- `sanity/schemaTypes/*.ts`, `campos.ts`, `index.ts`, `sanity/structure/deskStructure.ts`, `singletonIds.ts`.
- `scripts/seed/buildDocuments.ts`.
- `src/layouts/BaseLayout.astro`, `src/components/Seo.astro`, `Header.astro`, `MobileMenu.astro`, `FooterNav.astro`, `navigationLinks.ts`, `Logo.astro`, `Lightbox.astro`, `SkipLink.astro` y cada componente listado en la Tarea 7.
- `src/pages/*.astro`, `src/pages/obra/*.astro`, `src/pages/404.astro`, `src/pages/contacto/*`.
- `src/actions/contact.ts`, `src/middleware.ts`, `src/forms/*.ts`, `src/infrastructure/email/formatContactEmail.ts`, `src/seo/structuredData.ts`.
- `vitest.config.ts` (cobertura), `tests/fakes/FakeContentRepository.ts`, `tests/e2e/smoke.spec.ts`, `docs/04-cms.md`, `docs/07-cms-setup.md`.

**Eliminar**
- `src/actions/contactValidationMessages.ts` (sus textos pasan a `SiteTexts.contact`).

---

### Task 0: Preparar el worktree

- [x] `npm install` en el worktree (no comparte `node_modules` con el checkout principal).
- [x] Baseline: `npm run check && npm test` → todo verde. Si algo falla, reportar antes de seguir.

---

### Task 1: Idioma y rutas traducidas (dominio)

**Files:**
- Create: `src/domain/Locale.ts`, `src/domain/routing/{RouteKey,RouteTarget,routeSegments,pathTo,alternatePaths,localeFromPath,localizedPaths,DuplicateRouteError}.ts`
- Modify: `vitest.config.ts` (agregar `src/domain/routing/**` y `src/domain/Locale.ts` a `coverage.include`)
- Test: `tests/unit/routing/pathTo.test.ts`, `alternatePaths.test.ts`, `localeFromPath.test.ts`, `localizedPaths.test.ts`

**Interfaces (Produces):**
```ts
export type Locale = 'es' | 'en' | 'pt';
export const locales: readonly Locale[];            // ['es', 'en', 'pt']
export const defaultLocale: Locale;                 // 'es'
export const isLocale: (value: unknown) => value is Locale;
export const parseLocale: (value: string | null | undefined) => Locale; // inválido → 'es'

export type StaticRouteKey = 'home' | 'editorial' | 'retratos' | 'marcas' | 'eventos' | 'obra' | 'copias' | 'reservas';
export type RouteKey = StaticRouteKey | 'serie';
export type RouteTarget =
  | { route: StaticRouteKey; hash?: string; query?: Record<string, string> }
  | { route: 'serie'; slug: string; hash?: string };

export const routeSegments: Record<StaticRouteKey | 'obraBase', Record<Locale, string>>; // valores de la tabla; obraBase = obra|work|obra
export const pathTo: (locale: Locale, target: RouteTarget) => string;
export const alternatePaths: (targetFor: (locale: Locale) => RouteTarget) => Record<Locale, string>;
export const localeFromPath: (pathname: string) => Locale;
export interface LocalizedPath { locale: Locale; path: string; route: RouteKey; slug?: string }
export const localizedPaths: (locale: Locale, seriesSlugs: readonly string[]) => LocalizedPath[]; // lanza DuplicateRouteError
export class DuplicateRouteError extends Error { constructor(readonly path: string) }
```

- [x] **Step 1: Tests que fallan**

```ts
expect(pathTo('es', { route: 'home' })).toBe('/');
expect(pathTo('en', { route: 'home' })).toBe('/en/');
expect(pathTo('en', { route: 'retratos' })).toBe('/en/portraits');
expect(pathTo('pt', { route: 'copias' })).toBe('/pt/obra/copias');
expect(pathTo('en', { route: 'serie', slug: 'trades' })).toBe('/en/work/trades');
expect(pathTo('es', { route: 'home', hash: 'contacto', query: { tipo: 'editorial' } })).toBe('/?tipo=editorial#contacto');
expect(pathTo('en', { route: 'home', hash: 'encargos' })).toBe('/en/#encargos');
expect(pathTo('es', { route: 'copias', query: { copia: 'Bidones, 2024' } })).toBe('/obra/copias?copia=Bidones%2C+2024');

expect(alternatePaths(() => ({ route: 'marcas' }))).toEqual({ es: '/marcas', en: '/en/brands', pt: '/pt/marcas' });
expect(alternatePaths((locale) => ({ route: 'serie', slug: { es: 'oficios', en: 'trades', pt: 'oficios' }[locale] })))
  .toEqual({ es: '/obra/oficios', en: '/en/work/trades', pt: '/pt/obra/oficios' });

expect(localeFromPath('/en/portraits')).toBe('en');
expect(localeFromPath('/pt/')).toBe('pt');
expect(localeFromPath('/pt')).toBe('pt');
expect(localeFromPath('/entrevistas')).toBe('es');
expect(localeFromPath('/')).toBe('es');
expect(parseLocale('pt')).toBe('pt');
expect(parseLocale('fr')).toBe('es');
expect(parseLocale(null)).toBe('es');

expect(pathTo('en', { route: 'reservas' })).toBe('/en/bookings');
expect(pathTo('pt', { route: 'reservas' })).toBe('/pt/reservas');

expect(localizedPaths('en', ['trades']).map((entry) => entry.path)).toEqual(
  ['/en/', '/en/editorial', '/en/portraits', '/en/brands', '/en/events', '/en/work', '/en/work/prints', '/en/bookings', '/en/work/trades']);
expect(() => localizedPaths('en', ['prints'])).toThrow(new DuplicateRouteError('/en/work/prints'));
expect(() => localizedPaths('pt', ['oficios', 'oficios'])).toThrow(DuplicateRouteError);
```

- [x] **Step 2:** `npx vitest run tests/unit/routing` → FAIL (módulos inexistentes).
- [x] **Step 3:** Implementar. `pathTo` arma `prefix + segment` (`prefix` = `''` para es, `/${locale}` para el resto; home es `prefix + '/'`), luego `?` con `URLSearchParams` y `#hash`. `DuplicateRouteError` con mensaje `Ruta duplicada: ${path}. Cambiá el slug de la serie.`
- [x] **Step 4:** `npx vitest run tests/unit/routing` → PASS; `npm test` → cobertura 100 %.
- [x] **Step 5: Handoff** — `feat: add locale model and translated route map`

---

### Task 2: Textos de interfaz (`SiteTexts`) con defaults y overrides

**Files:**
- Create: `src/domain/SiteTexts.ts`, `src/domain/formatText.ts`, `src/application/GetSiteTexts.ts`, `src/infrastructure/texts/defaults/{esTexts,enTexts,ptTexts,defaultSiteTexts}.ts`, `src/infrastructure/texts/{resolveSiteTexts,SiteTextsOverrides}.ts`
- Modify: `src/domain/ContentRepository.ts` (agrega `getTexts(locale: Locale): Promise<SiteTexts>`), `SeedContentRepository.ts` (devuelve `defaultSiteTexts[locale]`), `SanityContentRepository.ts` (provisorio: `defaultSiteTexts[locale]`; la Tarea 5 lo completa), `tests/fakes/FakeContentRepository.ts`
- Modify: `vitest.config.ts` (agregar `src/infrastructure/texts/**`, `src/domain/formatText.ts`; excluir `src/infrastructure/texts/defaults/**`)
- Test: `tests/unit/texts/resolveSiteTexts.test.ts`, `tests/unit/texts/formatText.test.ts`, `tests/unit/texts/defaultSiteTexts.test.ts`

**Interfaces (Produces):**
```ts
export interface SiteTexts {
  a11y: { skipToContent; opensInNewTab; instagramOpensInNewTab; editorialStrip; lightbox; lightboxClose; lightboxPrevious; lightboxNext;
          mainNav; obraNav; mobileMenu; mobileMenuClose; sections; footerPager; seriesNav; availablePrints; aboutPrints; exits; languageSwitcher: string };
  nav: { home; editorial; retratos; marcas; eventos; obra; series; copias; aboutWork; encargos; bookSession; previous; next;
         previousSeries; nextSeries; viewSeries; backHome; logoHome; logoObra: string };
  pages: { gallery; services; sessions; investment; aboutMe; featuredPackage; untitled; obraEyebrow; seriesEyebrow; printsInquiryTitle; eventsTicker: string };
  contact: { name; email; copy; chooseCopy; workType; chooseOption; message; requiredNote; submit; sending; success; fieldErrors; genericError;
             copyMessage; channelEmail; channelWhatsapp; channelInstagram; workTypeEditorial; workTypeRetratos; workTypeMarcas; workTypeEventos;
             errorNombre; errorEmail; errorTipo; errorMensaje; errorCopia; unavailable; rateLimited;
             sentTitle; sentLead; errorTitle; errorLead; backToForm: string };
  seo: { homeTitle; jobTitle; artworkGenre; editorialDescription; retratosDescription; marcasTitle; marcasDescription;
         eventosDescription; obraDescription; copiasTitle; notFoundTitle; notFoundDescription: string };
  notFound: { title; lead: string };
}
export type SiteTextGroup = keyof SiteTexts;
export const formatText: (template: string, values: Record<string, string | number>) => string;

export type SiteTextsOverrides = { [G in SiteTextGroup]?: { [K in keyof SiteTexts[G]]?: Partial<Record<Locale, string>> | null } | null };
export const defaultSiteTexts: Record<Locale, SiteTexts>;
export const resolveSiteTexts: (overrides: SiteTextsOverrides | null, locale: Locale) => SiteTexts;

export class GetSiteTexts { constructor(repository: ContentRepository); execute(locale: Locale): Promise<SiteTexts> }
```

Reglas de contenido de los defaults:
- `esTexts` copia **literal** los textos que hoy están en el código (inventario: el grep de `>Texto<`, `aria-label=`, `title=`, `description=` y constantes en `src/components`, `src/pages`, `src/forms`, `src/actions/contactValidationMessages.ts`, `src/seo/structuredData.ts`). Así el español no cambia.
- Plantillas: `seriesEyebrow = 'Serie {number} · {count} fotografías · {years}'`, `copyMessage = 'Hola, me interesa la copia "{copy}".'`. `eventsTicker = 'Carnaval, Comparsas, Shows, Escenario, Sociales'` (la vista lo separa por `,`).
- `enTexts`/`ptTexts`: traducción natural, voseo → tratamiento neutro. Ej.: `nav.bookSession` en `'Book a session'`, pt `'Agendar sessão'`.

- [x] **Step 1: Tests que fallan**

```ts
it('uses Sarah override for the requested language', () => {
  const texts = resolveSiteTexts({ nav: { bookSession: { es: 'Agendá', en: 'Book now' } } }, 'en');
  expect(texts.nav.bookSession).toBe('Book now');
});
it('falls back to the default of the same language, not to the Spanish override', () => {
  const texts = resolveSiteTexts({ nav: { bookSession: { es: 'Agendá' } } }, 'en');
  expect(texts.nav.bookSession).toBe(defaultSiteTexts.en.nav.bookSession);
});
it('treats a blank override as missing', () => {
  expect(resolveSiteTexts({ nav: { bookSession: { pt: '   ' } } }, 'pt').nav.bookSession).toBe(defaultSiteTexts.pt.nav.bookSession);
});
it('returns defaults when the document does not exist yet', () => {
  expect(resolveSiteTexts(null, 'es')).toEqual(defaultSiteTexts.es);
});
it('tolerates null groups and keys coming from Sanity', () => {
  expect(resolveSiteTexts({ nav: null, contact: { submit: null } }, 'es')).toEqual(defaultSiteTexts.es);
});
it('trims the override', () => {
  expect(resolveSiteTexts({ contact: { submit: { es: ' Enviar ' } } }, 'es').contact.submit).toBe('Enviar');
});

expect(formatText('Serie {number} · {count} fotografías', { number: 'II', count: 14 })).toBe('Serie II · 14 fotografías');
expect(formatText('Hola {name}', {})).toBe('Hola {name}');

it('keeps the same placeholders in every language', () => {
  for (const locale of locales) {
    expect(placeholdersOf(defaultSiteTexts[locale].pages.seriesEyebrow)).toEqual(['count', 'number', 'years']);
    expect(placeholdersOf(defaultSiteTexts[locale].contact.copyMessage)).toEqual(['copy']);
  }
});
it('has a non-empty default for every key in every language', () => { /* recorre grupos y claves */ });

it('GetSiteTexts returns the texts of the requested language', async () => {
  const texts = await new GetSiteTexts(new FakeContentRepository()).execute('pt');
  expect(texts.nav.retratos).toBe(defaultSiteTexts.pt.nav.retratos);
});
```
(`placeholdersOf` es un helper del test: extrae `{x}` ordenados.)

- [x] **Step 2:** `npx vitest run tests/unit/texts` → FAIL.
- [x] **Step 3:** Implementar. `resolveSiteTexts` recorre `defaultSiteTexts[locale]` por grupo y clave; toma `overrides?.[g]?.[k]?.[locale]?.trim()` si no es vacío. `formatText` reemplaza `/\{(\w+)\}/g` solo si la clave existe. `GetSiteTexts` delega en `repository.getTexts(locale)`.
- [x] **Step 4:** `npm test` → PASS, cobertura 100 %.
- [x] **Step 5: Handoff** — `feat: add site texts with per-language defaults and overrides`

---

### Task 3: Esquemas de Sanity localizados y singleton "Textos del sitio"

**Files:**
- Create: `sanity/schemaTypes/localizados.ts`, `sanity/schemaTypes/textosDelSitio.ts`, `sanity/texts/siteTextLabels.ts`, `sanity/validation/reservedSlugs.ts`
- Modify: `sanity/schemaTypes/campos.ts`, `index.ts`, `foto.ts`, `faceta.ts`, `servicio.ts`, `itemInfo.ts`, `paqueteMarca.ts`, `antesDespues.ts`, `serie.ts`, `copia.ts`, `ajustes.ts`, `paginaInicio.ts`, `paginaMarcas.ts`, `paginaObra.ts`, `paginaCopias.ts`; `sanity/structure/deskStructure.ts`, `singletonIds.ts`
- Test: `tests/unit/sanity/reservedSlugs.test.ts`

**Interfaces (Produces):**
```ts
// sanity/schemaTypes/localizados.ts
export const textoLocalizado, parrafoLocalizado, tituloLocalizado, listaLocalizada, slugLocalizado; // defineType objects
// campos `es` / `en` / `pt`; en y pt dentro del fieldset { name: 'traducciones', title: 'Inglés y portugués', options: { collapsible: true, collapsed: true } }
// slugLocalizado: es/en/pt de tipo 'slug' (source es: el título en ese idioma)

// campos.ts mantiene los nombres y firmas actuales; cambia el tipo a la variante localizada
// y la validación de requerido pasa a `es`:
export const campoTexto, campoParrafo, campoTitulo, campoLista; // misma firma (name, title, description?)
export const requiredSpanish: (rule) => rule.custom((value) => (hasText(value?.es) ? true : 'Completá el texto en español.'));

// sanity/texts/siteTextLabels.ts
export type SiteTextLabels = { [G in SiteTextGroup]: { title: string; fields: { [K in keyof SiteTexts[G]]: string } } };
export const siteTextLabels: SiteTextLabels; // títulos en español para cada grupo y clave

// sanity/validation/reservedSlugs.ts
export const reservedSeriesSlugs: Record<Locale, readonly string[]>; // es: ['copias'], en: ['prints'], pt: ['copias']
export const seriesSlugProblem: (slug: string | undefined, locale: Locale) => string | true;
```

Qué se localiza (todo texto en lenguaje natural): `foto.alt`, `foto.titulo`; `faceta.nombre/titulo/lead/indexDescription/quote/ctaTexto/ctaButton`; `servicio.titulo/descripcion/precio`; `itemInfo` (sus textos); `paqueteMarca.nombre/precio/items`; `antesDespues.alt`; `serie.titulo/tituloVisible/slug/lineaCuratorial/textoCuratorial`; `ajustes.frase/sobreMi/retratoAlt/statement/muestras[].titulo`; todos los campos de texto de las cuatro páginas (incluye `ticker` y `tiposDeTrabajo`). **No** se localizan: `faceta.slug`, números, `anios`, `lugar`, `muestras[].lugar/anio`, `copia.tamanos` (medida y precio), email, WhatsApp, Instagram.

`textosDelSitio`: generado desde `siteTextLabels` y `defaultSiteTexts`. Un `group` del Studio por grupo de `SiteTexts`; un campo `object` por clave con `es`/`en`/`pt` tipo `string`, todos opcionales, con `placeholder` = default de ese idioma y descripción "Si lo dejás vacío se usa el texto de ejemplo." Para las claves con `{…}` la descripción agrega "Mantené las palabras entre llaves, por ejemplo {copy}." Va en la estructura como "Textos del sitio", primero en la lista, y se suma a `singletonIds`.

Validación de slugs de serie: `seriesSlugProblem` devuelve `'Esa dirección está reservada para la tienda de copias.'` si el slug está en `reservedSeriesSlugs[locale]`. Unicidad por idioma: `rule.custom` con un `getClient` que busca `count(*[_type == "serie" && slug[$locale].current == $slug && _id != $id])`.

- [x] **Step 1: Test que falla**

```ts
expect(seriesSlugProblem('copias', 'es')).toBe('Esa dirección está reservada para la tienda de copias.');
expect(seriesSlugProblem('prints', 'en')).toBe('Esa dirección está reservada para la tienda de copias.');
expect(seriesSlugProblem('prints', 'es')).toBe(true);
expect(seriesSlugProblem(undefined, 'en')).toBe(true);
```
- [x] **Step 2:** `npx vitest run tests/unit/sanity/reservedSlugs.test.ts` → FAIL.
- [x] **Step 3:** Implementar esquemas. `siteTextLabels` tipado contra `SiteTexts`: si falta una clave, `npm run check` falla.
- [x] **Step 4:** `npm run check && npm test` → PASS. Con `PUBLIC_SANITY_PROJECT_ID` configurado, `npm run dev` y abrir `/admin`: "Textos del sitio" muestra los grupos con los defaults como placeholder; una faceta muestra Español abierto y "Inglés y portugués" colapsado. Sin proyecto Sanity, dejar anotado que esta verificación queda pendiente.
- [x] **Step 5: Handoff** — `feat: localize Sanity schemas and add editable site texts singleton`

---

### Task 4: `ContentRepository` con idioma (dominio, use cases, semilla)

**Files:**
- Modify: `src/domain/ContentRepository.ts`, `src/domain/Series.ts`, todos los use cases en `src/application/*.ts`, `src/application/locateFacet.ts`, `src/infrastructure/seed/SeedContentRepository.ts`, `tests/fakes/FakeContentRepository.ts`, `tests/fixtures/aSeries.ts`, tests de `tests/unit/Get*.test.ts`, `ListSeriesSlugs.test.ts`, `tests/integration/SeedContentRepository.test.ts`
- `SanityContentRepository` solo compila en esta tarea (recibe `locale` sin usarlo); se completa en la Tarea 5.

**Interfaces:**
- Consumes: `Locale`, `pathTo`, `SiteTexts`, `defaultSiteTexts` (Tareas 1–2).
- Produces:
```ts
export interface ContentRepository {
  getSettings(locale: Locale): Promise<SiteSettings>;
  getHome(locale: Locale): Promise<HomeContent>;
  getFacets(locale: Locale): Promise<Facet[]>;
  getBrands(locale: Locale): Promise<BrandsContent>;
  getObra(locale: Locale): Promise<ObraContent>;
  getSeries(locale: Locale): Promise<Series[]>;
  getPrints(locale: Locale): Promise<Print[]>;
  getPrintsContent(locale: Locale): Promise<PrintsContent>;
  getTexts(locale: Locale): Promise<SiteTexts>; // ya existe desde la Tarea 2
}
export interface Series { /* actual */ ; slugs: Record<Locale, string> } // slug = slugs[locale]
// Use cases: execute(locale: Locale, ...actuales) — p.ej. GetFacetPage.execute(locale, 'editorial'), GetSeriesPage.execute(locale, slug), ListSeriesSlugs.execute(locale)
// locateFacet(facets, slug, locale, obraLabel: string): previous/next con href = pathTo(locale, { route: slug }); link a Obra = { label: obraLabel, href: pathTo(locale, { route: 'obra' }) }
```

- [x] **Step 1: Tests que fallan** (agregar a los existentes)

```ts
it('links neighbour facets inside the visitor language', async () => {
  const { previous, next } = await new GetFacetPage(new FakeContentRepository()).execute('en', 'retratos');
  expect(previous?.href).toBe('/en/editorial');
  expect(next?.href).toBe('/en/brands');
});
it('links neighbour series with the slug of the visitor language', async () => {
  const repository = new FakeContentRepository({ series: [aSeries({ slug: 'trades', slugs: { es: 'oficios', en: 'trades', pt: 'oficios' } }), aSeries({ number: 'II', slug: 'shapes', slugs: { es: 'geometrias', en: 'shapes', pt: 'geometrias' } })] });
  const { next } = await new GetSeriesPage(repository).execute('en', 'trades');
  expect(next?.href).toBe('/en/work/shapes');
});
it('serves Spanish content and the requested language texts in seed mode', async () => {
  const repository = createSeedRepository();
  expect((await repository.getHome('en')).lead).toBe((await repository.getHome('es')).lead);
  expect(await repository.getTexts('en')).toEqual(defaultSiteTexts.en);
});
it('points the home doors to the visitor language', async () => {
  const home = await createSeedRepository().getHome('pt');
  expect(home.encargosDoor.href).toBe('/pt/#encargos');
  expect(home.obraDoor.href).toBe('/pt/obra');
});
it('gives every seed series the same slug in all languages', async () => {
  const [series] = await createSeedRepository().getSeries('en');
  expect(series?.slugs).toEqual({ es: 'oficios', en: 'oficios', pt: 'oficios' });
});
```
- [x] **Step 2:** `npm test` → FAIL.
- [x] **Step 3:** Implementar. El link "Obra" de `locateFacet` toma su label de los textos: `GetFacetPage` y `GetBrandsPage` piden `getTexts(locale)` y pasan `texts.nav.obra` a `locateFacet`. `GetSeriesPage.toLink` usa `pathTo(locale, { route: 'serie', slug })`.
- [x] **Step 4:** `npm run check && npm test` → PASS, 100 %. (`npm run check` va a marcar las páginas `.astro` que llaman sin `locale`: pasarles `'es'` provisoriamente; la Tarea 7 las reemplaza.)
- [x] **Step 5: Handoff** — `refactor: pass locale through content repository and use cases`

---

### Task 5: Repositorio Sanity con resolución por idioma

**Files:**
- Create: `src/infrastructure/sanity/mapping/localize.ts`, `src/infrastructure/sanity/documents/SanityLocalized.ts`, `documents/SanitySiteTextsDocument.ts`, `queries/siteTextsQuery.ts`, `tests/fixtures/sanity/aSanitySiteTexts.ts`
- Modify: todos los `src/infrastructure/sanity/documents/Sanity*Document.ts`, `SanityService.ts`, `SanityInfoItem.ts`, todos los `mapping/to*.ts`, `SanityContentRepository.ts`, fixtures `tests/fixtures/sanity/*.ts`
- Test: `tests/unit/localize.test.ts`, `tests/unit/sanity/SanityContentRepository.test.ts`

**Interfaces:**
```ts
export type SanityLocalized<T> = Partial<Record<Locale, T | null>> | T; // T plano = dato sin migrar → español
export const localize: <T>(value: SanityLocalized<T> | null | undefined, locale: Locale) => T | undefined;
export const localizeRequired: <T>(value: SanityLocalized<T> | null | undefined, locale: Locale) => T; // undefined → '' / [] según tipo, igual que hoy con campos vacíos
// Mappers: toHome(document, locale), toFacet(document, locale), toPhoto(document, locale), ... — mismo nombre, nuevo 2.º parámetro
// SanityContentRepository.getTexts(locale): fetch siteTextsQuery (puede ser null) → resolveSiteTexts(document, locale)

// src/domain/Translations.ts
export type Translations = Record<Locale, boolean>;
// Se agrega `translations: Translations` a HomeContent, Facet, BrandsContent, ObraContent, Series, PrintsContent.
// src/infrastructure/sanity/mapping/translationsOf.ts
export const translationsOf: (...values: SanityLocalized<unknown>[]) => Translations; // es: true; en/pt: todos los valores tienen ese idioma no vacío
```
Campos principales que deciden `translations`: home `bajada` + `puertaEncargosTitulo`; faceta `titulo` + `lead`; página Marcas su título y bajada principales; página Obra `cita` + `tituloSobre` (los equivalentes de `quote`/`aboutTitle`); serie `titulo` + `textoCuratorial`; página Copias `titulo` + `bajada`. El repositorio semilla devuelve `{ es: true, en: false, pt: false }`.
Las queries **no** cambian de forma (siguen sin parámetros de idioma), así `CachedSanityClient` reutiliza un solo fetch para los tres idiomas del build.

- [x] **Step 1: Tests que fallan**

```ts
expect(localize({ es: 'Retratos', en: 'Portraits' }, 'en')).toBe('Portraits');
expect(localize({ es: 'Retratos', en: '' }, 'en')).toBe('Retratos');
expect(localize({ es: 'Retratos', pt: '  ' }, 'pt')).toBe('Retratos');
expect(localize({ es: ['a'], en: [] }, 'en')).toEqual(['a']);
expect(localize('Retratos', 'en')).toBe('Retratos');
expect(localize(null, 'en')).toBeUndefined();

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
it('keeps reading a photo alt saved before the migration', async () => { /* alt: 'Texto plano' → 'Texto plano' en 'en' */ });
it('localizes photo alt text', async () => { /* alt: { es, en } → en */ });
it('localizes rich titles keeping the italic word', async () => { /* titulo: { es: aSanityTitle(...), en: aSanityTitle(...) } */ });
it('marks a series as translated only in the languages that have its main fields', async () => {
  const series = aSanitySeries({ titulo: { es: 'Oficios', en: 'Trades', pt: 'Ofícios' }, textoCuratorial: { es: 'Texto', en: 'Text' } });
  const [result] = await repositoryWith({ series: [series] }).getSeries('es');
  expect(result?.translations).toEqual({ es: true, en: true, pt: false });
});
it('does not count a blank translation', () => {
  expect(translationsOf({ es: 'Hola', en: '  ' })).toEqual({ es: true, en: false, pt: false });
});
it('marks seed content as Spanish only', async () => {
  expect((await createSeedRepository().getHome('en')).translations).toEqual({ es: true, en: false, pt: false });
});
it('uses default texts when the site texts document does not exist', async () => {
  expect(await repositoryWith({ siteTexts: null }).getTexts('en')).toEqual(defaultSiteTexts.en);
});
it('applies Sarah overrides to site texts', async () => {
  const repository = repositoryWith({ siteTexts: aSanitySiteTexts({ nav: { bookSession: { en: 'Book now' } } }) });
  expect((await repository.getTexts('en')).nav.bookSession).toBe('Book now');
});
it('fetches each document once for all languages', async () => {
  const client = aSanityClient();
  const repository = new SanityContentRepository(new CachedSanityClient(client));
  await Promise.all(locales.map((locale) => repository.getHome(locale)));
  expect(client.requests.filter((query) => query === homeQuery)).toHaveLength(1);
});
```
- [x] **Step 2:** `npx vitest run tests/unit/sanity tests/unit/localize.test.ts` → FAIL.
- [x] **Step 3:** Implementar. Los tipos `Sanity*Document` cambian `string` → `SanityLocalized<string>` (y `SanityRichTitle`, `string[]`) solo en los campos listados en la Tarea 3. `aSanityWorld` agrega la respuesta de `siteTextsQuery`.
- [x] **Step 4:** `npm run check && npm test` → PASS, 100 %.
- [x] **Step 5: Handoff** — `feat: resolve Sanity content per language with Spanish fallback`

---

### Task 6: Semilla y migración de datos existentes

**Files:**
- Modify: `scripts/seed/buildDocuments.ts`, `scripts/seed/portableText.ts` (si hace falta)
- Create: `migrations/localize-fields/index.ts`
- Modify: `docs/07-cms-setup.md` (sección 3)

- [x] **Step 1:** En `buildDocuments`, envolver cada campo localizado de la Tarea 3 como `{ es: valor }` (slugs: `{ es: { _type: 'slug', current } }`). Documento nuevo `textosDelSitio` con `_id: 'textosDelSitio'` vacío (solo `_type`), así aparece en el Studio con los placeholders.
- [x] **Step 2:** `npm run seed -- --dry-run` → el plan muestra los documentos con campos `{ es: … }` y el documento `textosDelSitio`.
- [x] **Step 3:** Migración con `defineMigration` de `sanity/migrate` (verificar la API instalada en `node_modules/sanity/lib/migrate` o con Context7). Para cada tipo y campo de la Tarea 3: si el valor es `string`, array de strings, array de bloques o slug plano, reemplazarlo por `{ es: valor }`; si ya es objeto con `es`, no tocarlo (idempotente).
- [x] **Step 4:** Con un dataset de prueba: `npx sanity migration run localize-fields` (dry run por defecto) muestra los cambios; con `--no-dry-run` los aplica; correrla dos veces no produce cambios la segunda.
- [x] **Step 5:** Documentar en `docs/07-cms-setup.md`: "Si el dataset ya tenía contenidos antes del soporte de idiomas, corré la migración `localize-fields` una vez antes de abrir el Studio."
- [x] **Step 6: Handoff** — `feat: seed localized fields and add migration for existing content`

---

### Task 7: Rutas en/pt, vistas, SEO por idioma y selector de idioma

**Files:**
- Create: `src/views/*View.astro` (8), `src/views/views.ts`, `src/pages/[locale]/[...path].astro`, `src/components/LanguageSwitcher.astro`, `src/components/HreflangLinks.astro`
- Modify: `src/pages/index.astro`, `editorial.astro`, `retratos.astro`, `marcas.astro`, `eventos.astro`, `obra/index.astro`, `obra/[serie].astro`, `obra/copias.astro`, `404.astro`; `src/layouts/BaseLayout.astro`, `src/components/Seo.astro`, `Header.astro`, `MobileMenu.astro`, `FooterNav.astro`, `navigationLinks.ts`, `Logo.astro`, `Lightbox.astro`, `SkipLink.astro`, `home/*`, `facet/*`, `brands/*`, `obra/*` (los que tienen texto fijo o `href` interno, ver inventario), `src/seo/structuredData.ts`
- Test: `tests/e2e/i18n.spec.ts`, `tests/e2e/smoke.spec.ts`, `tests/e2e/seo.spec.ts`

**Interfaces:**
- Consumes: `pathTo`, `alternatePaths`, `localizedPaths` (T1), `GetSiteTexts`, `formatText` (T2), use cases con `locale` (T4).
- Produces:
```ts
// Cada vista: interface Props { locale: Locale } (+ slug: string en SeriesView)
// views.ts
export const views: Record<RouteKey, AstroComponentFactory>;
// BaseLayout Props: + locale: Locale; alternates: Record<Locale, string>; skipLabel: string
// Header Props: + locale: Locale; texts: SiteTexts; alternates: Record<Locale, string>
// navigationLinks(variant, locale, texts): HeaderLink[]
// LanguageSwitcher Props: { locale: Locale; alternates: Record<Locale, string>; label: string }
// structuredData: buildPersonSchema(settings, site, texts, locale), buildProfessionalServiceSchema(..., texts, locale), print list con texts.pages.untitled / texts.seo.artworkGenre; agrega inLanguage
```

Reglas:
- Cada página en español queda en una línea: `<EditorialView locale="es" />`. El cuerpo actual de la página se mueve a la vista sin cambiar el markup salvo textos e `href`.
- `[locale]/[...path].astro`: `getStaticPaths` recorre `['en', 'pt']`, llama `ListSeriesSlugs.execute(locale)` y `localizedPaths(locale, slugs)`; `params = { locale, path: path sin '/${locale}/' o undefined para home }`, `props = { route, slug }`; renderiza `views[route]`.
- Todo `href` interno sale de `pathTo(locale, …)`. Inventario a reemplazar: `navigationLinks.ts`, `Header.astro` (`/#contacto`), `Logo.astro`, `BrandsHero.astro`, `PackageCard.astro`, `ObraTeaser.astro`, `IndexRow.astro`, `SeriesChapter.astro`, `PrintsTeaser.astro`, `SeriesPrintsBand.astro`, `BrandsTeaser.astro`, `copias.astro`/`obra/index.astro` (previous/next), `contactHref` de editorial/retratos/eventos, links de copias (`?copia=`).
- Todo texto fijo sale de `texts.<grupo>.<clave>`; los componentes reciben solo el grupo que usan (p. ej. `Lightbox` recibe `texts: SiteTexts['a11y']`).
- `BaseLayout`: `<html lang>` según la tabla de Decisiones; recibe `translations: Translations` de la vista. Si `translations[locale]` es `false`: `<meta name="robots" content="noindex">`, canonical = `alternates.es` y sin `HreflangLinks`. Si es `true`: `HreflangLinks` emite `<link rel="alternate">` absolutos (con `Astro.site`) solo para los idiomas traducidos, más `x-default` = en si `translations.en`, si no es. `Seo`: `og:locale` del idioma y `og:locale:alternate` solo de los idiomas traducidos.
- Páginas sin contenido propio de CMS (404, resultados de contacto) no usan `translations`: 404 y `/contacto/*` ya son `noindex`.
- Sitemap: `src/pages/sitemap.xml.ts` (prerenderizado) usa el use case `ListSitemapEntries` y emite `<url>` por página indexable con `xhtml:link` por idioma traducido y `x-default`. Se quita `@astrojs/sitemap` de `astro.config.mjs` y de `package.json`; `robots.txt.ts` apunta a `/sitemap.xml`.

```ts
// src/application/ListSitemapEntries.ts
export interface SitemapEntry { path: string; alternates: Partial<Record<Locale | 'x-default', string>> }
export class ListSitemapEntries { constructor(repository: ContentRepository); execute(): Promise<SitemapEntry[]> }
// Recorre home, facetas, marcas, obra, copias y series con sus `translations`; una entrada por (página, idioma traducido).
// Las rutas de otras features (p. ej. `reservas`) se suman con su propio `translations`.
```
- `LanguageSwitcher`: en el header (desktop) y dentro de `MobileMenu`. Tres enlaces `ES · EN · PT` con `hreflang`, `lang`, `aria-current="true"` en el actual, `aria-label` = `texts.a11y.languageSwitcher`; cada enlace lleva a la página equivalente (`alternates`). `min-height: var(--tap)`.
- 404: textos de `defaultSiteTexts.es` resueltos con `GetSiteTexts('es')`, más enlaces "English" → `/en/` y "Português" → `/pt/`.

- [x] **Step 1: e2e que fallan** — `tests/e2e/i18n.spec.ts`

```ts
const localizedRoutes = ['/en/', '/en/portraits', '/en/brands', '/en/events', '/en/work', '/en/work/prints', '/en/work/oficios',
  '/pt/', '/pt/retratos', '/pt/obra', '/pt/obra/copias'];

test('every translated route answers 200 with one h1 and its html lang', ...);   // en → 'en', pt → 'pt-BR'
test('an untranslated English page is not indexed and points to the Spanish one', async ({ page }) => {
  await page.goto('/en/portraits');   // modo semilla: todo el contenido está solo en español
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/retratos$/);
  await expect(page.locator('link[hreflang]')).toHaveCount(0);
});
test('the sitemap lists only Spanish pages while nothing is translated', async ({ request }) => {
  const body = await (await request.get('/sitemap.xml')).text();
  expect(body).toContain('/retratos</loc>');
  expect(body).not.toContain('/en/');
  expect(body).not.toContain('/pt/');
});
test('language switcher keeps the visitor on the same page', async ({ page }) => {
  await page.goto('/retratos');
  await page.getByRole('link', { name: 'EN' }).click();   // en mobile-375 abrir el menú antes
  await expect(page).toHaveURL(/\/en\/portraits$/);
});
test('internal links never leave the visitor language', async ({ page }) => {
  for (const route of localizedRoutes) {
    await page.goto(route);
    const prefix = route.slice(0, 4);
    const hrefs = await page.locator('a[href^="/"]:not([hreflang])').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(hrefs.filter((href) => !href!.startsWith(prefix))).toEqual([]);
  }
});
test('interface copy is not left in Spanish', async ({ page }) => {
  // para cada clave cuyo default es !== en y length >= 12, el texto es no aparece en innerText ni en aria-label de /en/ y /en/work/prints
});
```
Unit (sin depender del modo semilla):
```ts
// tests/unit/ListSitemapEntries.test.ts
it('lists an English page with its alternates once Sarah translates it', async () => {
  const repository = new FakeContentRepository({ facets: allFacets().map((facet) =>
    facet.slug === 'retratos' ? { ...facet, translations: { es: true, en: true, pt: false } } : facet) });
  const entries = await new ListSitemapEntries(repository).execute();
  expect(entries).toContainEqual({ path: '/en/portraits', alternates: { es: '/retratos', en: '/en/portraits', 'x-default': '/en/portraits' } });
  expect(entries.find((entry) => entry.path === '/pt/retratos')).toBeUndefined();
});
it('uses the Spanish page as x-default when English is missing', async () => {
  const repository = new FakeContentRepository({ facets: allFacets().map((facet) =>
    facet.slug === 'retratos' ? { ...facet, translations: { es: true, en: false, pt: true } } : facet) });
  const entries = await new ListSitemapEntries(repository).execute();
  expect(entries).toContainEqual({ path: '/pt/retratos', alternates: { es: '/retratos', pt: '/pt/retratos', 'x-default': '/retratos' } });
});

// tests/unit/components/HreflangLinks.test.ts — con el container API de Astro (verificar nombre en Astro 7: experimental_AstroContainer)
it('announces only translated languages and English as x-default', async () => {
  const html = await container.renderToString(HreflangLinks, { props: {
    alternates: { es: '/retratos', en: '/en/portraits', pt: '/pt/retratos' },
    translations: { es: true, en: true, pt: false }, site: new URL('https://sarahmoreau.example') } });
  expect(html).toContain('hreflang="en" href="https://sarahmoreau.example/en/portraits"');
  expect(html).toContain('hreflang="x-default" href="https://sarahmoreau.example/en/portraits"');
  expect(html).not.toContain('hreflang="pt"');
});
```
Agregar `src/application/ListSitemapEntries.ts` a la cobertura (ya entra por `src/application/**`).

- [x] **Step 2:** `npm test` y `npm run test:e2e -- i18n` → FAIL (404 en `/en/…`, módulos inexistentes).
- [x] **Step 3:** Implementar vistas, ruta dinámica, layout, switcher y reemplazo de textos/`href`.
- [x] **Step 4:** Agregar a `smoke.spec.ts` las rutas de `localizedRoutes` (status 200, axe sin violaciones, sin overflow a 375 px). Actualizar `seo.spec.ts`: lo que hoy chequea `sitemap-index.xml` pasa a `/sitemap.xml`; `/retratos` mantiene su canonical propio y no tiene `noindex`.
- [x] **Step 5:** `npm run check && npm test && npm run build && npm run test:e2e` → todo verde. Screenshots de `/en/` y `/pt/obra` a 375 y 1280 px revisados a ojo (textos largos en inglés/portugués no rompen el header ni los botones).
- [x] **Step 6: Handoff** — `feat: serve English and Portuguese pages with translated URLs and language switcher`

---

### Task 8: Formulario de contacto en tres idiomas

**Files:**
- Modify: `src/components/home/ContactForm.astro`, `src/forms/submitContactForm.ts`, `src/forms/preselectContactForm.ts`, `src/actions/contact.ts`, `src/pages/contacto/enviar.ts`, `src/pages/contacto/enviado.astro`, `src/pages/contacto/error.astro`, `src/middleware.ts`, `src/domain/ContactMessage.ts`, `src/application/SendContactMessage.ts`, `src/infrastructure/email/formatContactEmail.ts`
- Delete: `src/actions/contactValidationMessages.ts`
- Test: `tests/unit/email/formatContactEmail.test.ts`, `tests/unit/SendContactMessage.test.ts`, `tests/fixtures/aContactSubmission.ts`, `tests/e2e/contact.spec.ts`

**Interfaces:**
```ts
export interface ContactMessage { name; email; type; message; copy: string; locale: Locale }
// formatContactEmail agrega la línea `Idioma: Español | Inglés | Portugués` después de "Tipo de trabajo"
// ContactForm Props: + locale: Locale; texts: SiteTexts['contact']
//   <input type="hidden" name="idioma" value={locale}>
//   data-messages={JSON.stringify(texts)}  (el script lee success, sending, fieldErrors, genericError, rateLimited, unavailable, copyMessage, error<Campo>)
//   data-tipos: { editorial: texts.workTypeEditorial, retratos: …, marcas: …, eventos: … }
// action: input + idioma (z.string().nullish() → parseLocale); los mensajes de zod pasan a ser el nombre del campo ('nombre', 'email', …)
// enviar.ts: redirect a /contacto/enviado?idioma=xx o /contacto/error?idioma=xx&campos=… / &motivo=envio
// middleware: LIMIT_REDIRECT usa localeFromPath(new URL(referer).pathname) → /contacto/error?motivo=limite&idioma=xx (referer ausente o inválido → es)
// enviado.astro y error.astro: prerender = false; idioma = parseLocale(searchParams.get('idioma')); textos con GetSiteTexts; backHref = pathTo(idioma, { route: 'home', hash: 'contacto' }) / { route: 'home' }
```
El valor oculto `tipo = 'Copia de autor'` de las consultas de copias no se traduce: es lo que lee Sarah en el mail.

- [x] **Step 1: Tests que fallan**

```ts
expect(formatContactEmail(aContactMessage({ locale: 'pt' })).text).toContain('Idioma: Portugués');
it('passes the visitor language to the email', async () => { /* SendContactMessage con locale 'en' → FakeMessageSender recibe locale 'en' */ });
```
e2e en `contact.spec.ts`:
```ts
test('English visitor sees validation errors in English', async ({ page }) => {
  await page.goto('/en/#contacto');
  // completar nombre de 1 letra, email válido, mensaje corto → enviar
  await expect(page.locator('[data-error-for="nombre"]')).toHaveText(defaultSiteTexts.en.contact.errorNombre);
});
test('Portuguese visitor without JavaScript lands on the Portuguese result page', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  // /pt/ → enviar formulario válido → URL /contacto/enviado?idioma=pt, h1 = defaultSiteTexts.pt.contact.sentTitle
});
test('rate limited English visitor sees the English message', ...); // 6 envíos sin JS desde /en/ → /contacto/error?motivo=limite&idioma=en
```
- [x] **Step 2:** `npm test` y `npm run test:e2e -- contact` → FAIL.
- [x] **Step 3:** Implementar.
- [x] **Step 4:** `npm run check && npm test && npm run build && npm run test:e2e` → verde.
- [x] **Step 5: Handoff** — `feat: localize contact form, result pages and inquiry email`

---

### Task 9: Documentación para Sarah

**Files:**
- Modify: `docs/04-cms.md` (tipos localizados, `textosDelSitio`), `docs/07-cms-setup.md` ("Guía para Sarah"), `CLAUDE.md` (mapa del sitio con rutas en/pt)

- [x] **Step 1:** Guía para Sarah, en español y paso a paso: "Traducir una página" (abrir el documento → "Inglés y portugués" → completar → Publicar; lo que quede vacío se ve en español), "Cambiar un texto del sitio" (Textos del sitio → grupo → idioma → Publicar; vaciarlo vuelve al texto de ejemplo; mantener las palabras entre llaves), "Dirección en inglés de una serie" (campo Dirección web → Inglés; no cambiarla una vez publicada).
- [x] **Step 2:** Actualizar el mapa del sitio en `CLAUDE.md` con la tabla de segmentos.
- [x] **Step 3:** Verificación final completa: `npm run check && npm test && npm run build && npm run test:e2e`; levantar `HOST=localhost PORT=4321 node dist/server/entry.mjs` y recorrer `/`, `/en/`, `/pt/obra/copias` a mano.
- [x] **Step 4: Handoff** — `chore: document translations and site texts for the editor`

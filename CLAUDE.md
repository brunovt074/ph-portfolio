# Sarah Moreau — sitio de fotografía y video

Sitio portfolio + comercial para **Sarah Moreau**, fotógrafa y realizadora audiovisual (Argentina).
Objetivo de negocio: que el sitio **venda** (sesiones, servicios para marcas, copias de autor) y
que ella pueda **actualizarlo sola** desde un CMS, sin depender del desarrollador.

El diseño ya está aprobado en un mockup (canvas de Claude Design). Esta carpeta es el traspaso
de diseño a código. Leé este archivo completo antes de escribir código y consultá `docs/` cuando
trabajes en cada área.

> Contexto importante: el sitio es una **sorpresa** para Sarah. Las fotos de `assets/fotos-baja/`
> son capturas de su Instagram en baja resolución (~280 px). Sirven para maquetar; las finales
> llegan desde el CMS. Si existe `assets/fotos-alta/<id>.jpg`, tiene prioridad sobre la baja.
> Ver `docs/05-fotos.md`.

## Concepto: una marca, dos puertas

La home abre con dos entradas grandes:

1. **Encargos** — trabajo comercial, en cuatro facetas, cada una con su propia página y paleta:
   Editorial & Moda · Retratos & Estudio · Marcas · Eventos & Carnaval.
2. **Obra** — mini-sitio artístico dentro del mismo dominio (`/es/obra`), con lenguaje propio:
   más silencio, más lento, imágenes a pantalla completa, series y copias de autor a la venta.

Mismo logotipo, misma tipografía y mismo rojo de acento en todo el sitio; lo que cambia por
sección es el color de fondo y el ritmo.

## Stack

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **Astro** (última estable) + islas **React** | Portfolio con muchas imágenes: HTML estático, poco JS, React solo donde hay interacción. |
| Estilos | **Tailwind CSS v4** con los tokens de `design/tokens.css` en `@theme` | Tokens únicos, sin colores ni tamaños sueltos. |
| CMS | **Sanity** con Studio embebido en `/admin` (`@sanity/astro`) | CDN de imágenes con recortes y *hotspot*: crítico para una fotógrafa. Plan gratuito alcanza. |
| Imágenes | Pipeline de Sanity (`@sanity/image-url`): `srcset`, AVIF/WebP, LQIP | Fotos pesadas servidas al tamaño justo. |
| Animación | **GSAP** (+ ScrollTrigger, SplitText, Flip), **Lenis**, View Transitions de Astro | GSAP es 100 % gratuito, incluidos todos sus plugins, también para uso comercial. |
| Formularios | Astro Actions + **Resend** (email) | Contacto y consulta de copias. |
| Deploy | Vercel o Cloudflare Pages, rebuild por webhook de Sanity al publicar | Estático, rápido y gratis a esta escala. |

Antes de instalar, verificá versiones y APIs actuales con el MCP de Context7 (no asumas APIs de memoria).

## Mapa del sitio

```
/es/                    Home: dos puertas + resumen de encargos + teaser de Obra + contacto
/es/editorial           Encargos 01
/es/retratos            Encargos 02
/es/marcas              Encargos 03 (la página que más vende: paquetes, proceso, antes/después)
/es/eventos             Encargos 04
/es/obra                Obra: inicio (manifiesto + índice de series)
/es/obra/[serie]        Página de serie (secuencia tipo fotolibro)
/es/obra/copias         Tienda de copias de autor (consulta, sin checkout en v1)
/admin                  Sanity Studio
```

Cada idioma bajo su prefijo — `/es`, `/en`, `/pt` — con segmentos traducidos
(`src/domain/routing/routeSegments.ts`). La URL define el idioma: no hay redirecciones por
`Accept-Language`. La raíz `/` redirige a `/es/`. Las páginas sin traducir salen con `noindex`;
`/sitemap.xml` lista solo las indexables.

| Página | es | en | pt |
|---|---|---|---|
| Home | `/es/` | `/en/` | `/pt/` |
| Editorial | `/es/editorial` | `/en/editorial` | `/pt/editorial` |
| Retratos | `/es/retratos` | `/en/portraits` | `/pt/retratos` |
| Marcas | `/es/marcas` | `/en/brands` | `/pt/marcas` |
| Eventos | `/es/eventos` | `/en/events` | `/pt/eventos` |
| Obra | `/es/obra` | `/en/work` | `/pt/obra` |
| Copias | `/es/obra/copias` | `/en/work/prints` | `/pt/obra/copias` |
| Serie | `/es/obra/{slug}` | `/en/work/{slug}` | `/pt/obra/{slug}` |

Detalle de cada página, sección por sección: `docs/02-paginas.md`.

## Reglas de diseño (no negociables)

- **Tokens solamente.** Colores, tipos, espacios y radios salen de `design/tokens.css`. Nada de hex sueltos.
- **Logotipo único:** `Sarah <em>Moreau</em>` (apellido en itálica), Bodoni Moda 22 px. En Obra se agrega `/ obra` en gris.
- **Una sola escala tipográfica** (ver `docs/01-design-system.md`). Todos los H1 de página usan `--text-display`.
- **La foto manda.** Nada de sombras, gradientes decorativos, bordes redondeados en fotos ni tarjetas con borde izquierdo.
- **Fluido y mobile-first.** Layouts con `flex-wrap` / `grid auto-fit`; sin anchos fijos en px. Probar a 375 px.
- **Accesible:** contraste AA, `alt` descriptivo en toda foto (viene del CMS), foco visible, objetivos táctiles ≥ 44 px, `prefers-reduced-motion` respetado.

## Animaciones

Plan completo por sección en `docs/03-animaciones.md`. Principios:
- Cada animación tiene que aportar a la faceta; nada decorativo porque sí.
- Solo `transform` y `opacity` (y `clip-path` donde se indica). Nada que mueva el layout.
- Todo detrás de `prefers-reduced-motion`; sin JS el sitio se ve completo.
- GSAP y Lenis se cargan solo en las páginas que los usan (islas `client:visible`).

## CMS

Esquemas, campos y qué edita Sarah: `docs/04-cms.md`. `assets/seed.json` trae los datos iniciales
(fotos, facetas, series, títulos provisorios, textos alternativos) para poblar el CMS con un script.

## Criterios de terminado

- Lighthouse ≥ 95 en Performance, Accessibility, Best Practices y SEO (mobile).
- LCP < 2,5 s en 4G simulado con fotos reales en alta.
- Sarah puede, sin ayuda: subir una foto a una serie o faceta, cambiar un precio, publicar una copia nueva.
- Las páginas se ven bien a 375, 768, 1280 y 1440 px.
- Verificación visual con Playwright (screenshots) antes de dar algo por terminado.

## Placeholders pendientes

Todo lo que figura entre corchetes en el mockup (`[PRECIO]`, `[EMAIL]`, `[NÚMERO]`, `[AÑO]`,
`[Ciudad]`, statement artístico, muestras) se carga desde el CMS. Nunca inventar datos reales.

## Orden de trabajo sugerido

1. Scaffold Astro + Tailwind + tokens + fuentes autoalojadas. Layout base, header, footer.
2. Esquemas de Sanity + script de seed con `assets/seed.json`.
3. Páginas estáticas, en este orden: Home → Marcas → Obra → resto.
4. Pipeline de imágenes (srcset, LQIP, lazy) probado con fotos en alta.
5. Animaciones, de la más estructural a la más fina (ver orden en `docs/03-animaciones.md`).
6. Formularios, SEO (meta, OG, sitemap, JSON-LD `Photographer` / `LocalBusiness`), analítica.
7. Deploy + webhook de Sanity + dominio.

Referencia visual: el canvas de Claude Design (pedile el link al dueño del proyecto).

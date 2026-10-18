# Registro de cambios

Todas las modificaciones notables del proyecto se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y el
proyecto usa [Versionado Semántico](https://semver.org/lang/es/).

## [Sin publicar]

### Añadido
- Sitio portfolio en Astro + Tailwind CSS v4 con tokens de diseño y fuentes autoalojadas.
- Páginas: home, editorial, retratos, marcas, eventos, obra, series y copias.
- Pipeline de imágenes con `srcset`, AVIF/WebP y LQIP desde Sanity.
- Animaciones con GSAP (ScrollTrigger, SplitText, Flip), Lenis y View Transitions.
- CMS Sanity con Studio en `/admin` y seed desde `assets/seed.json`.
- Formulario de contacto con Astro Actions + Resend y rate limit.
- SEO: meta, Open Graph, `sitemap.xml` con `hreflang` y JSON-LD.
- Internacionalización es/en/pt con URLs traducidas y selector de idioma.
- Textos de interfaz editables desde Sanity (`textosDelSitio`) con valores por defecto por idioma.
- Migración `localize-fields` para contenidos previos al soporte de idiomas.

### Cambiado
- Los casos de uso y el repositorio de contenido reciben el idioma (`locale`).

### Corregido
- Unicidad de slug de serie por idioma y reserva de slugs fijos (`copias`, `prints`).

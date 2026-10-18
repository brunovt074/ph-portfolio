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
- Las URLs en español llevan prefijo `/es` (antes sin prefijo); `/` redirige a `/es/`. Las páginas de resultado del formulario quedan bajo `/{idioma}/contacto/…`.

### Corregido
- Tipografía: los títulos en Bodoni Moda usan peso 500 y tamaño óptico fijo (`opsz` 11) para que los trazos finos (travesaños de la `t` y la `e`) no desaparezcan.
- `/marcas`, `/retratos` y `/reservas` pasan a la paleta oscura (`ink`) como el resto del sitio; el modo claro queda para más adelante.
- Se elimina la vista previa flotante de «Cuatro miradas» en la home (quedaba rezagada al cambiar de fila).
- i18n desactivada temporalmente: solo se publica el castellano (`enabledLocales` en `src/domain/Locale.ts`); `/en` y `/pt` dejan de generarse y se oculta el selector de idioma. El código y los textos en/pt se conservan para retomar la tarea.
- Unicidad de slug de serie por idioma y reserva de slugs fijos (`copias`, `prints`).

# 05 · Fotos

## Estado actual

`assets/fotos/` tiene 65 fotos de uso libre (Unsplash License y Pexels License, aptas para uso comercial) más el retrato de la fotógrafa.
Organizadas por carpeta (`editorial/`, `retratos/`, `marcas/`, `eventos/`, `obra/`) y descritas en `assets/seed.json`
(campo `archivo` relativo a `assets/`, `alt` y `hotspot`).
Resolución: 1600–2400 px de lado largo, JPG sRGB. Autor, licencia y fuente de cada una: `assets/fotos/CREDITS.md`
y `assets/fotos/credits/*.json`.

Son fotos de stock que representan cada sección; el portfolio es una demostración.

## Cómo se usan

- **Desarrollo y build:** `npm run photos` (corre solo en `predev` y `prebuild`) genera `assets/fotos-dev/<id>.jpg` y `lqip.json` desde `archivo`.
  `assets/fotos-dev/` va en `.gitignore`.
- **Sanity:** `npm run seed` sube las imágenes (usa `fotos-dev/<id>.jpg` si existe, si no `archivo`) y recrea los documentos.

## Cambiar una foto

1. Guardar la nueva en `assets/fotos/<faceta>/<id>.jpg` (mismo id que en `seed.json`).
2. Actualizar `alt` y `hotspot` en `seed.json` y la fila en `assets/fotos/CREDITS.md`.
3. `npm run photos` y, para el CMS, `npm run seed`.

Solo se admiten fotos con licencia que permita uso comercial sin atribución obligatoria; sin marcas ni logos visibles.

## Para producción

La fotógrafa sube sus originales al CMS (JPG a 2400–3000 px del lado largo, sRGB). Sanity se encarga del resto.

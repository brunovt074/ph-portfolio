# 05 · Fotos

## Estado actual

`assets/fotos-baja/` tiene 65 fotos (más un retrato provisorio de Lara) recortadas de capturas del Instagram de Lara, a ~280 px de ancho.
Organizadas por carpeta (`editorial/`, `retratos/`, `marcas/`, `eventos/`, `obra/`) y descritas en `assets/seed.json`.
Sirven para **maquetar y poblar el CMS**, no para producción.

Algunas tienen restos de íconos de Instagram en una esquina; se van con las fotos en alta.

## Para desarrollo: 5 o 6 fotos en alta

Para probar el comportamiento real (srcset, LQIP, LCP, transición miniatura → grande, revelado)
alcanza con unas pocas en alta resolución (≥ 1080 px). Prioridad, de `assets/fotos-a-pedir.jpg`:

1. Hero de la home: **#4** (pelo rojo enrulado, puerta Encargos) y **#14** (hombre con bidones, puerta Obra).
2. Un par de galería editorial: **#1** y **#2**.
3. Una de Obra a pantalla completa: **#16** o la de escalera al cielo.

### Dónde ponerlas

`assets/fotos-alta/`, con **el mismo id como nombre** que su versión baja (ej. `ed02.jpg`, `au01.jpg`;
los ids están en `seed.json` y en la hoja `fotos-a-pedir.jpg`). Sin subcarpetas.
El script de seed usa la versión alta si existe y si no cae a `fotos-baja/`.
`assets/fotos-alta/` va en `.gitignore`: las fotos en alta viven en Sanity, no en el repo.

Si todavía no hay originales, usar fotos libres en alta (Unsplash) con proporciones similares
**solo en desarrollo**; nunca subirlas al CMS de producción.

## Para producción

Las finales las sube Lara al CMS cuando conozca el proyecto (originales de su disco o la
descarga de datos de Instagram: Configuración › Tu actividad › Descargar tu información).
Recomendación para ella: JPG a 2400–3000 px del lado largo, sRGB. Sanity se encarga del resto.

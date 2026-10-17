# 04 · CMS (Sanity)

Studio embebido en `/admin` con `@sanity/astro`. Interfaz en español (títulos y descripciones de
cada campo en español; Sarah no es técnica). Plan gratuito de Sanity alcanza para este volumen.

Principio: **Sarah tiene que poder hacer sola** subir fotos, ordenarlas, cambiar precios, publicar
una copia o una serie nueva. Todo lo demás (estructura, diseño) queda fijo en código.

## Documentos

### `foto`
| Campo | Tipo | Notas |
|---|---|---|
| imagen | image (hotspot: true) | El hotspot define el recorte en todas las proporciones. |
| alt | string, requerido | Descripción para accesibilidad y SEO. |
| titulo | string | Opcional (obligatorio si pertenece a una serie). |
| lugar, anio | string, number | Pie de foto en series. |
| facetas | array de referencias a `faceta` | Una foto puede estar en varias. |
| destacada | boolean | Candidata a hero / portada. |

### `faceta` (Editorial, Retratos, Marcas, Eventos)
| Campo | Tipo |
|---|---|
| nombre, slug, numero | string, slug, number |
| titulo (con palabra en itálica) | Portable Text simple (solo itálica) |
| bajada | text |
| portada | array de 3 referencias a `foto` |
| galeria | array ordenable de referencias a `foto` |
| servicios | array de objetos `{titulo, descripcion, precio?}` |
| ctaTexto | string |

### `paqueteMarca` (solo Marcas)
`nombre`, `precio` (string, permite "desde" o "/ mes"), `items` (array de strings), `destacado` (boolean), `orden`.

### `antesDespues` (solo Marcas)
`antes` (image), `despues` (image), `alt`, `orden`.

### `serie` (Obra)
| Campo | Tipo |
|---|---|
| numero (romano) | string |
| titulo, slug | string, slug |
| anios | string |
| lineaCuratorial | string (una línea, para el índice) |
| textoCuratorial | text |
| fotos | array ordenable de `{foto: ref, layout: 'centro' | 'izquierda' | 'derecha' | 'par' | 'sangre'}` |

### `copia` (Obra)
`foto` (ref), `serie` (ref), `edicion` (number, ej. 10), `disponibles` (number), `tamanos` (array de `{medida, precio}`), `activa` (boolean).

### `ajustes` (singleton)
Email, WhatsApp, cuentas de Instagram, texto "Sobre mí", retrato de Sarah, statement artístico,
muestras y publicaciones (array `{titulo, lugar, anio}`), info de impresión/envío/enmarcado de copias.

## Seed

`assets/seed.json` contiene las 65 fotos del mockup (más el retrato provisorio de Sarah) con faceta, alt, y para Obra la serie, título
provisorio y layout. Escribir un script (`scripts/seed.ts`) que suba las imágenes de
`assets/fotos-baja/` y cree los documentos. Al llegar las fotos en alta, Sarah reemplaza la imagen
de cada documento y conserva todo lo demás.

## Publicación

Webhook de Sanity → deploy hook del hosting: cada vez que Sarah publica, el sitio se reconstruye (~1 min).

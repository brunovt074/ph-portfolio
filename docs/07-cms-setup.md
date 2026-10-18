# 07 · Puesta en marcha del CMS (Sanity)

Sin variables de entorno el sitio funciona en modo semilla (lee `assets/seed.json` y `assets/content.json`).
Con `PUBLIC_SANITY_PROJECT_ID` definido, lee de Sanity y el Studio queda en `/admin`.

## 1. Crear el proyecto

1. Entrá a https://www.sanity.io/manage y creá un proyecto (plan gratuito). Anotá el Project ID.
2. Creá un dataset `production` (público, sin datos sensibles).
3. En API > CORS origins agregá `http://localhost:4321`, la URL de producción y la de preview, con "Allow credentials".
4. En API > Tokens creá un token con permiso Editor (solo para cargar la semilla). No lo subas al repo.

## 2. Variables de entorno

Copiá `.env.example` a `.env` y completá:

| Variable | Uso |
|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | Activa Sanity y el Studio. Vacía = modo semilla. |
| `PUBLIC_SANITY_DATASET` | Por defecto `production`. |
| `SANITY_WRITE_TOKEN` | Solo para `npm run seed`. No se usa en el sitio. |
| `SITE_URL` | URL pública final (canonical, Open Graph, sitemap, JSON-LD). Por defecto `https://laravischi.com`. |
| `RESEND_API_KEY` | Clave de Resend para enviar el formulario de contacto. |
| `CONTACT_TO_EMAIL` | Casilla de Lara donde llegan las consultas. |
| `CONTACT_FROM_EMAIL` | Remitente verificado en Resend, por ejemplo `Sitio Lara Vischi <contacto@tu-dominio.com>`. |
| `CONTACT_DELIVERY_MODE` | `console` escribe las consultas en el log del servidor en lugar de enviarlas (pruebas locales y e2e). Dejarla vacía en producción. |
| `TRUST_PROXY` | `true` si el sitio corre detrás de un proxy de confianza (hosting con balanceador): el límite de envíos usa la primera IP de `x-forwarded-for`. Vacía = usa la IP de la conexión. No la actives si el servidor es accesible directamente, porque cualquiera podría falsear ese encabezado. El formulario admite 5 envíos cada 10 minutos por IP. |

En el hosting definí `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, `SITE_URL` y las variables de email (nunca el token de escritura de Sanity).

## 3. Cargar los contenidos iniciales

1. `npm run seed -- --dry-run` muestra el plan sin tocar la red.
2. `npm run seed` sube las imágenes (usa `assets/fotos-dev/`, que sale de `fotos-alta/` si existe y si no de `fotos-baja/`) y crea los documentos con ids fijos (`foto-ed01`, `faceta-editorial`, `serie-oficios`, `copia-au03`, `paquete-esencial`, `ajustes`, `paginaInicio`...). Es repetible: reemplaza lo que tenga el mismo id, así que no lo corras después de que Lara editó contenido.
3. Para reemplazar una foto provisoria por la definitiva, Lara cambia solo la imagen del documento `foto`.
4. Si el dataset ya tenía contenidos antes del soporte de idiomas, corré la migración `localize-fields` una vez antes de abrir el Studio: `npx sanity migration run localize-fields` muestra los cambios (modo prueba) y `npx sanity migration run localize-fields --no-dry-run` los aplica. Mueve cada texto existente al campo Español y se puede repetir sin efectos. El seed ya crea los documentos con este formato, y también `textosDelSitio` (vacío: el Studio muestra los textos de ejemplo como placeholder).

## 4. Studio

`npm run dev` y abrí `http://localhost:4321/admin`. Las páginas siguen siendo estáticas; el Studio usa navegación por hash.

## 5. Publicación automática

1. En el hosting creá un Deploy Hook.
2. En sanity.io/manage > API > Webhooks creá uno hacia ese hook, dataset `production`, eventos Create, Update y Delete.
3. Cada vez que Lara publica, el sitio se reconstruye (~1 min).

## Guía para Lara

### Subir una foto a una serie
1. Entrá a `/admin` > Fotos > Todas las fotos > "+".
2. Subí la imagen, tocá "Recorte y punto focal" y marcá lo que no se puede cortar.
3. Escribí la descripción (entre 10 y 160 letras) y el título.
4. Tocá Publicar.
5. Andá a Obra > Series, abrí la serie, en "Fotos de la serie" tocá "Agregar", elegí la foto y cómo se muestra.
6. Arrastrá para ordenar y tocá Publicar.

### Cambiar un precio
1. Paquetes de Marcas: Marcas > Paquetes > el paquete > campo Precio > Publicar.
2. Copias: Obra > Copias > la copia > Tamaños y precios > Publicar.

### Publicar una copia
1. Asegurate de que la foto exista en Fotos y esté en una serie.
2. Obra > Copias > "+". Elegí la foto y la serie.
3. Completá tamaño de la edición, copias disponibles, tamaños y precios, y un número de orden.
4. Dejá "Publicada en la tienda" encendida y tocá Publicar. Para ocultarla sin borrarla, apagala.

Las páginas con textos (Inicio, Marcas, Obra, Copias) se editan en Páginas.

### Traducir una página
1. Abrí el documento (una faceta, una serie, una página, una foto...).
2. En cada campo, desplegá "Inglés y portugués".
3. Completá el inglés y/o el portugués y tocá Publicar.
4. Lo que quede vacío se ve en español. Una página aparece en Google en inglés o portugués recién cuando están traducidos sus textos principales.

### Cambiar un texto del sitio
1. Entrá a "Textos del sitio" (primero en la lista).
2. Abrí el grupo (por ejemplo Formulario de contacto), elegí el idioma y escribí el texto nuevo.
3. Tocá Publicar. Si lo vaciás, vuelve al texto de ejemplo (el que ves gris dentro del campo).
4. Mantené las palabras entre llaves, por ejemplo {copy}: el sitio las reemplaza solo.

### Dirección en inglés de una serie
1. Abrí la serie y buscá el campo Dirección web.
2. Desplegá "Inglés y portugués" y generá o escribí la dirección en inglés.
3. No la cambies una vez publicada: cambiar una dirección hace que Google pierda la página anterior.

## 6. Servidor, formulario de contacto y email

El sitio sigue siendo estático (`output: 'static'`), pero usa el adaptador `@astrojs/node` en modo `standalone` porque el formulario necesita un servidor. Solo son bajo demanda la acción `contact` (`/_actions/contact`), el endpoint `POST /contacto/enviar` (envío sin JavaScript) y las páginas de resultado `/{idioma}/contacto/enviado` y `/{idioma}/contacto/error`; el resto se sirve prerenderizado.

- `npm run build` genera `dist/client` (estático) y `dist/server/entry.mjs`. Se levanta con `HOST=0.0.0.0 PORT=4321 node dist/server/entry.mjs`.
- Con JavaScript, el formulario llama a la acción y muestra el resultado en la misma página. Sin JavaScript, envía a `/contacto/enviar` y redirige a `/{idioma}/contacto/enviado` o `/{idioma}/contacto/error`.
- Sin `RESEND_API_KEY`: en desarrollo (`npm run dev`) las consultas se loguean en la terminal; en producción el visitante ve un mensaje para escribir por email o WhatsApp. Para probar el build localmente sin Resend usá `CONTACT_DELIVERY_MODE=console`.

### Configurar Resend

1. Creá una cuenta en https://resend.com y verificá el dominio desde el que se enviará (registros DNS).
2. Creá una API key con permiso de envío.
3. Cargá `RESEND_API_KEY`, `CONTACT_TO_EMAIL` y `CONTACT_FROM_EMAIL` en el hosting.
4. Probá el formulario en producción: el mail llega con `Reply-To` apuntando al visitante.

### Cambiar de hosting

Hay que cambiar el adaptador en `astro.config.mjs` y reinstalar el paquete correspondiente; el código de la acción no cambia.

- Vercel: `npm i @astrojs/vercel`, `import vercel from '@astrojs/vercel'` y `adapter: vercel()`.
- Cloudflare: `npm i @astrojs/cloudflare`, `import cloudflare from '@astrojs/cloudflare'` y `adapter: cloudflare()`. Las variables se definen en el panel de Cloudflare y los secretos del servidor se leen igual con `astro:env/server`.

En ambos casos retirá `@astrojs/node` y revisá la guía oficial del adaptador antes de publicar.

## 7. SEO

- Cada página define título y descripción propios; la imagen para redes (1200 x 630) sale de la foto principal de la página. Con fotos en baja resolución la imagen generada es más chica; con las definitivas queda en 1200 x 630.
- `sitemap.xml` y `robots.txt` se generan a partir de `SITE_URL`; `/admin` y las rutas de contacto (`/contacto/*` y `/*/contacto/*`) quedan afuera.
- La home publica datos estructurados `Person` y `ProfessionalService`; `/es/obra/copias` publica un `ItemList` de `VisualArtwork`. Se omiten los valores que todavía son placeholders (email, teléfono, precios). Cuando Lara cargue dirección o teléfono reales se pueden sumar a `src/seo/structuredData.ts`.

## 8. Analítica (recomendación, aún no instalada)

Usar una herramienta sin cookies, así no hace falta banner de consentimiento: Cloudflare Web Analytics (gratis, si el sitio queda en Cloudflare) o Plausible. Se agrega con un solo `<script>` en `src/layouts/BaseLayout.astro`. Eventos útiles para medir: envío del formulario de contacto y clic en "Consultar esta copia".

# 09 · Deploy en el VPS (Docker + Traefik)

El sitio corre en un contenedor (`Dockerfile` en la raíz) detrás del Traefik de Easypanel. Mientras no haya dominio se usa `https://72-60-247-32.sslip.io` (sslip.io resuelve a la IP del VPS y Traefik pide el certificado a Let's Encrypt).

## Piezas en el VPS (`/opt/sarah-moreau`)

| Archivo | Uso |
|---|---|
| `compose.yaml` | Build args (`PUBLIC_SANITY_*`, `SITE_URL`, `BLOCK_INDEXING`, `BUILD_ID`) y puerto `172.18.0.1:4321`. |
| `app.env` | Variables de runtime. Sin `SANITY_WRITE_TOKEN`. `TRUST_PROXY=true`. |
| `rebuild.sh` / `trigger.sh` | Reconstruye con `BUILD_ID` nuevo para que Docker vuelva a leer Sanity. Agrupa publicaciones con una espera de 15 s. |
| `/etc/sarah-hooks.json` | Receptor del webhook (`webhook`, servicio `sarah-webhook` en `172.18.0.1:9000`). Exige el header `X-Rebuild-Secret`. |
| `/etc/easypanel/traefik/config/sarah-moreau.yaml` | Rutas de Traefik: el sitio y `/hooks`. |

## Publicar cambios de código

`rsync -az --delete --exclude-from=.dockerignore --exclude=/.git ./ root@<vps>:/opt/sarah-moreau/src/` y luego `cd /opt/sarah-moreau && BUILD_ID=$(date +%s) docker compose up -d --build`.

## Contenido

Sanity > API > Webhooks: `POST https://<host>/hooks/sarah-rebuild`, dataset `production`, eventos Create, Update y Delete, filtro `!(_type in ["sanity.imageAsset","sanity.fileAsset"])`, header `X-Rebuild-Secret`. Cada publicación reconstruye el sitio en ~90 s.

## Lanzamiento con dominio

1. Vaciar `BLOCK_INDEXING` en `compose.yaml` y `app.env` (con `true` el sitio no se indexa).
2. Cambiar `SITE_URL` y el host de las rutas de Traefik.
3. Agregar el origen en Sanity > API > CORS origins.
4. Verificar el dominio en Resend y completar `RESEND_API_KEY` y `CONTACT_*`.

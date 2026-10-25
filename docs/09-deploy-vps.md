# 09 · Deploy en el VPS (Docker + Traefik)

El sitio corre en un contenedor (`Dockerfile` en la raíz) detrás del Traefik de Easypanel. Mientras no haya dominio se usa `https://sarahmoreauph.l6pr0s.easypanel.host`: el dominio comodín `*.l6pr0s.easypanel.host` resuelve a la IP del VPS y Traefik ya tiene su certificado.

## Piezas en el VPS (`/opt/sarahmoreauph`)

Las plantillas están en `deploy/`.

| Archivo en el VPS | Plantilla | Uso |
|---|---|---|
| `compose.yaml` | `deploy/compose.yaml` | Build args (`PUBLIC_SANITY_*`, `SITE_URL`, `BLOCK_INDEXING`, `BUILD_ID`) y puerto `172.18.0.1:4321`. |
| `app.env` | `.env.example` | Variables de runtime. Sin `SANITY_WRITE_TOKEN`. `TRUST_PROXY=true`. No está en el repo. |
| `rebuild.sh` / `trigger.sh` | `deploy/rebuild.sh`, `deploy/trigger.sh` | Reconstruye con `BUILD_ID` nuevo para que Docker vuelva a leer Sanity. Agrupa publicaciones con una espera de 15 s. |
| `/etc/sarahmoreauph-hooks.json` | `deploy/hooks.json` | Receptor del webhook (`webhook`, servicio `sarahmoreauph-webhook` en `172.18.0.1:9000`). Exige el header `X-Rebuild-Secret`. |
| `/etc/systemd/system/sarahmoreauph-webhook.service` | `deploy/webhook.service` | Servicio systemd del receptor. |
| `/etc/easypanel/traefik/config/sarahmoreauph.yaml` | `deploy/traefik.yaml` | Rutas de Traefik: el sitio y `/hooks`. |

## Publicar cambios de código

GitHub Actions (`.github/workflows/ci-cd.yml`):

- En cada pull request y en cada push a `main` corre `npm run check` y `npm test`.
- Al mergear a `main` y pasar los checks, sincroniza el código a `/opt/sarahmoreauph/src/` con rsync, ejecuta `BUILD_ID=<sha> docker compose up -d --build` en el VPS y verifica que `<SITE_URL>/es/` responda.

Configuración del repositorio en GitHub:

| Tipo | Nombre | Valor |
|---|---|---|
| Secret | `VPS_HOST` | IP o host del VPS. |
| Secret | `VPS_SSH_KEY` | Clave privada dedicada al deploy (su pública está en `authorized_keys` del VPS). |
| Secret | `VPS_KNOWN_HOSTS` | Salida de `ssh-keyscan <host>`. |
| Variable | `SITE_URL` | URL pública del sitio, para la verificación posterior al deploy. |

Deploy manual (fallback): `rsync -az --delete --exclude-from=.dockerignore --exclude=/.git ./ root@<vps>:/opt/sarahmoreauph/src/` y luego `cd /opt/sarahmoreauph && BUILD_ID=$(date +%s) docker compose up -d --build`.

## Contenido

Sanity > API > Webhooks: `POST https://<host>/hooks/sarahmoreauph-rebuild`, dataset `production`, eventos Create, Update y Delete, filtro `!(_type in ["sanity.imageAsset","sanity.fileAsset"])`, header `X-Rebuild-Secret`. Cada publicación reconstruye el sitio en ~90 s.

## Lanzamiento con dominio

1. Vaciar `BLOCK_INDEXING` en `compose.yaml` y `app.env` (con `true` el sitio no se indexa).
2. Cambiar `SITE_URL` y el host de las rutas de Traefik.
3. Agregar el origen en Sanity > API > CORS origins.
4. Verificar el dominio en Resend y completar `RESEND_API_KEY` y `CONTACT_*`.

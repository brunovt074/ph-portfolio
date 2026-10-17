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

En el hosting definí las dos primeras (nunca el token).

## 3. Cargar los contenidos iniciales

1. `npm run seed -- --dry-run` muestra el plan sin tocar la red.
2. `npm run seed` sube las imágenes (usa `assets/fotos-dev/`, que sale de `fotos-alta/` si existe y si no de `fotos-baja/`) y crea los documentos con ids fijos (`foto-ed01`, `faceta-editorial`, `serie-oficios`, `copia-au03`, `paquete-esencial`, `ajustes`, `paginaInicio`...). Es repetible: reemplaza lo que tenga el mismo id, así que no lo corras después de que Lara editó contenido.
3. Para reemplazar una foto provisoria por la definitiva, Lara cambia solo la imagen del documento `foto`.

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

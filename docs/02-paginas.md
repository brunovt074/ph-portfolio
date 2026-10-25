# 02 · Páginas

Cada página, sección por sección, tal como está en el mockup aprobado. Los textos entre comillas
son los del mockup (se pueden cargar desde el CMS); lo que está entre corchetes es un placeholder.

---

## `/` Home — fondo `--ink`

1. **Header.**
2. **Hero "dos puertas".**
   - Fila superior: H1 `Sarah Moreau` (Moreau en acento, itálica) + bajada a la derecha:
     "Fotografía y video. Encargos para personas y marcas, y una obra personal que se construye paso a paso."
   - Dos paneles foto a sangre, alto `clamp(440px, 68vh, 760px)`, proporción de ancho 3:2:
     - **Encargos** (foto editorial color) → ancla a la sección Encargos. Etiqueta "Puerta 1", subtítulo "Editorial · Retratos · Marcas · Eventos".
     - **Obra** (foto B/N) → `/obra`. Etiqueta "Puerta 2", "Obra" en itálica, "Series personales · Copias de autor".
   - Rótulo de cada panel: banda inferior `rgba(13,13,12,.8)` con texto.
3. **Ticker**: Editorial ✦ Retratos ✦ Marcas ✦ Eventos ✦ Obra (Bodoni itálica, ✦ en acento).
4. **Sobre mí** (fondo `--paper`): retrato de Sarah en B/N + cita "Cada fotografía es un registro de nuestro paso." + párrafo [trayectoria] + botón "Trabajemos juntos".
5. **Encargos: cuatro miradas** (`id="encargos"`): 4 filas de índice (01–04) con miniaturas → cada faceta.
6. **Tira editorial**: 5 fotos a sangre, `grid auto-fit`, gap 4 px.
7. **Para marcas** (fondo `--sand`): H2 "La fotografía también construye identidad de marca." + lista de 4 servicios con "desde USD …" + botón → `/marcas`. A la derecha, grilla 2×2 escalonada.
8. **Teaser de Obra**: H2 "Obra" + 4 fotos B/N + link "Entrar a la obra →".
9. **Contacto** (`id="contacto"`, fondo `--surface-2`): "Hablemos." + email, WhatsApp, tres cuentas de Instagram + formulario (nombre, email, tipo de trabajo, mensaje).
10. **Footer.**

Instagram: `@sarahmoreau.foto`, `@sarahmoreauph`, `@sarahmoreau.video`.

---

## `/editorial` — fondo `--ink`

1. Header (Editorial activo).
2. Intro: eyebrow "01 — Editorial & Moda", H1 "Imagen con *actitud*", lead a la derecha.
3. Portada: foto grande (2/3) + columna de 2 fotos (1/3).
4. Galería masonry: `columns: 3 280px`, ~11 fotos.
5. Servicios: 3 columnas con numeral itálico (i., ii., iii.): Lookbooks & campañas · Books de modelo · Artistas & músicos.
6. Banda CTA en acento: "¿Tenés una producción en mente?" → contacto.
7. Footer: ← Inicio · Siguiente: Retratos →

## `/retratos` — fondo `--paper`

1. Header. 2. Intro + 2 fotos escalonadas. 3. Galería `grid auto-fit` 3:4 (8 fotos).
4. **Sesiones**: 4 columnas (Retrato personal, Maternidad, Familias, Marca personal) con descripción y precio en USD.
5. Banda oscura con cita: "Creemos que tenemos mucho *tiempo*. Las fotos nos recuerdan que no." + CTA.
6. Footer.

## `/marcas` — fondo `--sand` (la página que más vende)

1. Header con CTA "Pedir presupuesto".
2. H1 "Fotos que *venden*" + lead + botón "Cotizar mi proyecto".
3. **Rubros**: 4 tarjetas grandes 4:5 (Producto & cosmética, Gastronomía, Joyería & accesorios, Espacios & alquileres).
4. Grilla cuadrada de 6 trabajos más.
5. **Antes / después** del retoque (NUEVO en código, no está en el mockup): slider comparativo. Ella ya publica este contenido; es el argumento de venta más fuerte.
6. **Cómo trabajamos**: 4 pasos (Brief, Concepto, Producción, Entrega).
7. **Paquetes** (fondo `--ink`): Esencial · Identidad (destacado, invertido) · Mensual. Todos con precio en USD.
8. Footer.

## `/eventos` — fondo `--eventos-bg`, acento lima

1. Header. 2. H1 "Plumas, luces y *ritmo*". 3. Galería `grid-auto-flow: dense`, la primera ocupa 2 filas.
4. Tres servicios (Carnaval & comparsas, Shows & escenario, Sociales & deportes).
5. Banda lima "¿Cuándo es tu evento?". 6. Footer.

---

## `/obra` — fondo `--obra-bg` (mini-sitio)

Header propio: `Sarah Moreau / obra` · Series · Copias de autor · Sobre la obra · Encargos ↗ (gris).

1. Foto de apertura a casi pantalla completa (`82vh`) con pie "I. Contraluz — *Sin título*, París, 2022".
2. H1 "*Obra*" + cita de su bio: "Una bitácora de mi trabajo, porque cada fotografía es un registro de nuestro paso."
3. **Series** (`id="series"`): 4 capítulos alternando imagen izquierda/derecha. Cada uno: numeral romano en acento, título, "N fotografías · [AÑOS]", una línea curatorial, 3–4 fotos con alturas distintas, "Ver serie →".
   - I. Contraluz · II. Geometrías · III. Lo que queda · IV. Viajes en color · V. Rojo sobre gris
4. **Sobre la obra** (`id="sobre"`, fondo marfil): [statement artístico] + lista de muestras y publicaciones.
5. Teaser de copias → `/obra/copias`.
6. Footer.

## `/obra/[serie]`

1. Intro centrada: "Serie II · 7 fotografías · [AÑOS]", H1 con media palabra en itálica ("Geo*metrías*"), texto curatorial.
2. **Secuencia tipo fotolibro**: una figura por "pantalla", ritmo variable: centrada grande → alineada a la izquierda → a la derecha → par lado a lado → centrada → a sangre. El ritmo lo define el campo `layout` de cada foto en el CMS.
3. Banda "disponible como copias de autor".
4. Navegación entre series (anterior / siguiente).

## `/obra/copias`

1. H1 "Copias *de autor*" + bajada.
2. Grilla `auto-fill minmax(300px,1fr)` de tarjetas de copia (paspartú, título itálica, serie, "Edición de 10 · quedan [N]", tamaños y precios, "Consultar esta copia").
   v1: la consulta abre un formulario prellenado (o mailto). Checkout real (Mercado Pago) queda para v2.
3. Banda marfil con 4 ítems: Impresión · Firma y certificado · Envío · Enmarcado.

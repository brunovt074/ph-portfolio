# 01 · Sistema de diseño

Tokens en `design/tokens.css`. Este documento explica cómo usarlos.

## Tipografía

Dos familias, autoalojadas (Fontsource o la API de fuentes de Astro), con `font-display: swap`:

- **Bodoni Moda** (variable, con `opsz`): títulos, logotipo, citas, numerales. Pesos 400 y 500, normal e itálica.
- **Archivo**: todo lo demás. Pesos 400, 500 y 600.

La itálica de Bodoni es el gesto de la marca: se usa para **una palabra** dentro de un título
(`Imagen con <em>actitud</em>`), nunca para un título entero, salvo "Obra" y los títulos de copias.

| Rol | Token | Fuente | Notas |
|---|---|---|---|
| H1 de página | `--text-display` | Bodoni 400 | leading 0.88, tracking −0.03em. Igual en TODAS las páginas. |
| H2 de sección | `--text-h2` | Bodoni 400 | leading 1, tracking −0.02em |
| Banda CTA | `--text-cta` | Bodoni 400 | |
| Cita / manifiesto | `--text-quote` | Bodoni 400 | |
| Título de tarjeta / serie | `--text-h3` | Bodoni 400 | |
| Lead | `--text-lead` | Archivo 400 | leading 1.65, máx. ~560 px de ancho |
| Eyebrow | `--text-eyebrow` | Archivo 400 | UPPERCASE, tracking 0.22em, color muted |
| Navegación | 13 px | Archivo 400 | UPPERCASE, tracking 0.14em |
| Botón | 14–15 px | Archivo 600 | tracking 0.06em, píldora, alto 48 px |

### Logotipo

`Lara <em>Vischi</em>` — Bodoni 22 px, tracking 0.01em, apellido en itálica. En el hero de la home
se repite a `--text-display` con "Vischi" en color de acento. En Obra: `Lara <em>Vischi</em> <span>/ obra</span>`
con el sufijo en `--obra-muted`. Es un componente (`<Logo variant="default|obra" />`), no texto suelto.

## Color por sección

| Sección | Fondo | Texto | Acento |
|---|---|---|---|
| Home, Editorial | `--ink` | `--paper` | `--accent` |
| Retratos | `--paper` | `--ink` | `--accent-on-light` |
| Marcas | `--sand` | `--ink` | `--accent-on-light` |
| Eventos | `--eventos-bg` | `--paper` | `--eventos-accent` |
| Obra (todo `/obra`) | `--obra-bg` | `--obra-ink` | `--accent` (mínimo) |

Bandas alternas dentro de una página (manifiesto en claro sobre home oscura, etc.) se indican en `02-paginas.md`.
Contraste: los pares de la tabla cumplen AA; no combinar `*-muted-dark` sobre claro ni viceversa.

## Componentes base

- **Header**: logotipo · nav (Editorial, Retratos, Marcas, Eventos, Obra) · CTA píldora "Reservar sesión".
  `flex-wrap`; en mobile el nav pasa a una segunda línea (o menú, ver animaciones). La sección actual va en color de acento.
- **Footer**: navegación anterior/siguiente entre facetas + logotipo.
- **Botones**: primario (relleno), secundario (borde 1 px), ambos píldora. Mínimo 48 px de alto.
- **Fila de índice** (home, "Encargos"): número · título + descripción · 3 miniaturas · flecha. Toda la fila es un link.
- **Tarjeta de servicio / paquete**: título Bodoni, precio, lista; el paquete destacado invierte colores.
- **Tarjeta de copia** (Obra): foto con paspartú (padding 28 px sobre marfil), título en itálica, serie, edición, tamaños y precio, botón de consulta.
- **Figura de serie**: foto + pie con número (`II.4`), título en itálica y `[Ciudad], [Año]`.

## Fotos

- Sin radio, sin sombra, sin borde. Separación `--gap-photo`.
- Proporciones habituales: 3:4 (retrato), 4:5 (destacadas), 1:1 (cuadrícula de producto).
- Siempre `object-fit: cover` con el *hotspot* del CMS como `object-position`.
- Placeholder: LQIP (blur) de Sanity mientras carga, fundido de 300 ms.

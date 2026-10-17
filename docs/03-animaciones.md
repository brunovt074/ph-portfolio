# 03 · Animaciones

Herramientas: **GSAP** (core + ScrollTrigger + SplitText + Flip; todo gratuito, uso comercial incluido),
**Lenis** para scroll suave, **View Transitions** de Astro (`<ClientRouter />`) para transiciones entre páginas.

Reglas:
- Solo `transform`, `opacity` y `clip-path`. Nada que dispare layout.
- `prefers-reduced-motion: reduce` → sin Lenis, sin parallax, sin pin; los reveals pasan a fundido simple o nada.
- Sin JS, todo el contenido es visible (los estados iniciales "ocultos" se aplican desde JS, no desde CSS).
- Duraciones 0.6–1.2 s, easing `power3.out` / `expo.out`. Nada rebota.
- En mobile: sin efectos de cursor; los pins horizontales pasan a scroll vertical normal.

Orden de implementación (de lo estructural a lo fino):

| # | Animación | Dónde | Cómo |
|---|---|---|---|
| 1 | **Scroll suave** | Global | Lenis sincronizado con el ticker de GSAP (`lenis.on('scroll', ScrollTrigger.update)`). |
| 2 | **Miniatura → foto grande** | Galerías, series, copias | View Transitions con `transition:name` compartido entre la miniatura y la foto de destino (lightbox o página). Es el efecto que más "sitio caro" transmite. |
| 3 | **Reveal del título** | H1 de todas las páginas | SplitText por líneas/caracteres, cada uno sube desde una máscara (`overflow: hidden`), stagger 0.03 s. "Moreau" entra último. |
| 4 | **Reveal de fotos** | Todas las galerías | `clip-path: inset(100% 0 0 0)` → `inset(0)` con leve `scale` 1.08 → 1 al entrar en viewport (ScrollTrigger, `once: true`). |
| 5 | **Parallax de las dos puertas** | Home hero | Cada foto se desplaza a velocidad distinta dentro de su panel (`yPercent`); al hover el panel crece levemente (flex-grow) y el otro se oscurece. |
| 6 | **Imagen que sigue al cursor** | Home, filas de "Encargos" | Al pasar por una fila, una foto flotante de esa faceta sigue al cursor con inercia (`gsap.quickTo`). Clásico de Codrops. Solo con puntero fino. |
| 7 | **Galería horizontal anclada** | `/editorial` | La sección de galería se fija (pin) y las fotos avanzan en horizontal al scrollear, como pasar páginas de una revista. En mobile: grilla normal. |
| 8 | **Antes / después** | `/marcas` | Slider comparativo arrastrable (isla React; `clip-path` sobre la foto "después"). Accesible por teclado (input range). |
| 9 | **Ticker y tira con velocidad** | Home ticker, `/eventos` | Marquee infinito cuya velocidad y dirección siguen la velocidad del scroll (`ScrollTrigger.getVelocity`). Ritmo de carnaval. |
| 10 | **Revelado de cuarto oscuro** | Todo `/obra` | Cada foto aparece como en la cubeta: de blanco/sobreexpuesta a contraste final (`filter: brightness(2.2) contrast(.4)` → normal, 1.4 s) con grano de película sutil en overlay (SVG noise animado, opacidad 0.06). La firma de la sección artística. |
| 11 | **Secuencia de serie** | `/obra/[serie]` | Cada figura entra con el revelado y el pie aparece 0.3 s después. Contador fijo discreto "II.4 / 7" que se actualiza al scrollear. |
| 12 | **Menú mobile** | Global | Panel a pantalla completa, links en Bodoni grande que entran con stagger. |

Performance: GSAP y Lenis en una isla `client:visible` por página que los necesite; nunca en el bundle global.
Medir con Lighthouse después de cada animación agregada.

# Estado del proyecto

Sitio portfolio y comercial de Sarah Moreau (fotografía y video). Astro + React, Sanity,
Tailwind CSS v4, despliegue estático. Detalle en `CLAUDE.md` y `docs/`.

## Ramas activas

| Rama | Estado | Notas |
|---|---|---|
| `feature/i18n-editable-texts-2` | Completa (9/9 tareas) | i18n es/en/pt + textos editables. |
| `feature/bookings-payments` | En curso | Backend de reservas (seña/total, agenda). Pendiente UI y revisión. |

## Integración pendiente

`feature/bookings-payments` mergea `feature/i18n-editable-texts-2` dentro de sí
(i18n → bookings). Ya absorbió las Tasks 1–5; restan 6–9:

1. Semilla y migración de campos localizados.
2. Rutas en/pt, vistas, SEO por idioma y selector.
3. Formulario de contacto en tres idiomas.
4. Documentación para el editor.

## Validación

- `npm run check` — 0 errores de tipo (`astro check`)
- `npm test` — vitest, cobertura 100 % en `src/application` y repositorios
- `npm run build` — build estático
- `npm run test:e2e` — Playwright con Chrome del sistema

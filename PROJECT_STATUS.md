# Estado del proyecto

Sitio portfolio y comercial de Lara Vischi (fotografía y video). Astro + React, Sanity,
Tailwind CSS v4, despliegue estático. Detalle en `CLAUDE.md` y `docs/`.

## Ramas activas

| Rama | Estado | Notas |
|---|---|---|
| `feature/i18n-editable-texts-2` | Completa (9/9 tareas + prefijo `/es`) | i18n es/en/pt con URLs prefijadas + textos editables. |
| `feature/bookings-payments` | En curso | Backend de reservas (seña/total, agenda) sobre i18n completo. Pendiente revisión. |

## Integración

`feature/bookings-payments` ya integra `feature/i18n-editable-texts-2` completa (9/9 tareas y prefijo `/es`).
Reservas vive en `/es/reservas`, `/en/bookings` y `/pt/reservas`; las páginas a demanda
(`/reservas/[id]`, `/reservas/error`, `/reservas/iniciar`, `/reservas/reintentar`, simulador) quedan sin prefijo y en español.

## Validación

- `npm run check` — 0 errores de tipo (`astro check`)
- `npm test` — vitest, cobertura 100 % en `src/application` y repositorios
- `npm run build` — build estático
- `npm run test:e2e` — Playwright con Chrome del sistema

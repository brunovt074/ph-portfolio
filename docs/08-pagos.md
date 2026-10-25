# Reservas, pagos y agenda

## Una sola instancia del server

El MVP asume una sola instancia del server. La exclusión mutua que evita que dos clientas tomen el mismo turno (`InProcessBookingLock`) vive en memoria del proceso. Para escalar a varias instancias hay que reemplazarla por un bloqueo en la base (por ejemplo un advisory lock de Postgres) detrás del mismo puerto `BookingLock`.

## Agenda

- Sin `CALENDAR_PROVIDER`, o con una sesión sin duración, o sin horarios cargados en Sanity: la clienta propone fecha y franja.
- Con calendario, duración y horarios: la clienta elige un turno. Se retiene mientras paga (por defecto 30 minutos) y solo se aceptan medios de pago instantáneos.
- El calendario de la fotógrafa es la fuente de lo ocupado (`freeBusy`) y recibe un evento al confirmarse el pago.

## Cómo funciona la reserva

1. La clienta entra a `/reservas` (en inglés `/en/bookings`, en portugués `/pt/reservas`), elige una sesión, fecha y horario, y decide si paga la seña o el total.
2. El servidor calcula el monto (nunca se confía en el navegador), crea la reserva y abre el cobro en la pasarela.
3. La clienta paga en Mercado Pago y vuelve a `/reservas/<id>`, que lee el estado real desde la base.
4. La pasarela avisa por webhook a `/api/payments/webhook/<proveedor>`; ahí se confirma el pago, se crea el evento en el calendario y salen los mails.

Estados de la reserva (texto):

```
awaiting_payment ──pago aprobado──> confirmed
awaiting_payment ──pago en proceso──> pending_payment ──aprobado──> confirmed
awaiting_payment ──pago rechazado──> payment_rejected ──reintento──> awaiting_payment
awaiting_payment ──vence el plazo──> expired
confirmed ──turno ocupado mientras pagaba──> needs_rescheduling (la fotógrafa coordina otro)
confirmed / needs_rescheduling ──cancelación──> cancelled
```

Con turnos del calendario la reserva se retiene 30 minutos mientras se paga; en modo "fecha propuesta", 48 horas.

## Rutas

| Ruta | Para qué |
|---|---|
| `/reservas` | Formulario (estático, con traducciones) |
| `/reservas/iniciar`, `/reservas/reintentar` | Envíos sin JavaScript (POST) |
| `/reservas/error` | Qué corregir si falló el envío |
| `/reservas/<id>` | Resultado de la reserva (no se indexa) |
| `/reservas/simulador/<id>` | Pasarela falsa, solo con `PAYMENT_PROVIDER=simulado` |
| `/api/bookings/slots` | Turnos libres (JSON, sin caché) |
| `/api/payments/webhook/<proveedor>` | Avisos de la pasarela |

## Variables de entorno

`DATABASE_URL`, `PGLITE_DIR`, `PAYMENT_PROVIDER`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `BOOKING_DEMO`, `CALENDAR_PROVIDER`, `GOOGLE_CALENDAR_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `TRUST_PROXY`.

## Base de datos

- Producción: Postgres con `DATABASE_URL` y `npm run db:migrate`.
- Desarrollo: PGlite embebido (`PGLITE_DIR`, por defecto `./.data/pglite`; `memory://` para pruebas).

## Mercado Pago, paso a paso

1. Crear una aplicación en el panel de desarrolladores de Mercado Pago (Checkout Pro).
2. Copiar las credenciales de prueba, y más tarde las de producción; el Access Token va en `MERCADOPAGO_ACCESS_TOKEN`.
3. Crear usuarios de prueba (vendedora y compradora) para ensayar pagos.
4. En Webhooks, configurar `https://<dominio>/api/payments/webhook/mercadopago` con el evento "Pagos".
5. Copiar la clave secreta del webhook a `MERCADOPAGO_WEBHOOK_SECRET`.

## Modo simulado (solo desarrollo)

`PAYMENT_PROVIDER=simulado` y `CALENDAR_PROVIDER=simulado` habilitan una pasarela y una agenda falsas. `BOOKING_DEMO=true` carga precios, duraciones y horarios de demostración desde `assets/booking-demo.json` y muestra un aviso en la página. Nunca usarlos en producción.

## Agregar una pasarela nueva (Pix, adquirente bancario)

1. Implementar `PaymentGateway` (`src/domain/payment`).
2. Registrarla en `createPaymentGateways`.
3. El webhook ya queda en `/api/payments/webhook/<proveedor>`.
4. Escribir sus tests.

## Devolver una seña

Se hace desde el panel de Mercado Pago, fuera del sistema.

## Guía para la fotógrafa

- Los precios se cargan en Studio, en Reservas > Sesiones reservables. Sin precio la sesión aparece como `[PRECIO]` y no se puede pagar.
- Los horarios semanales se cargan en la agenda de reservas; Google Calendar es tu agenda y Mercado Pago tu caja.
- Cuando llega una reserva recibís un mail, el turno aparece en tu calendario y la clienta recibe su resumen.
- Los textos de la página están en el grupo "booking" de Textos del sitio.

# Reservas, pagos y agenda

## Una sola instancia del server

El MVP asume una sola instancia del server. La exclusión mutua que evita que dos clientas tomen el mismo turno (`InProcessBookingLock`) vive en memoria del proceso. Para escalar a varias instancias hay que reemplazarla por un bloqueo en la base (por ejemplo un advisory lock de Postgres) detrás del mismo puerto `BookingLock`.

## Agenda

- Sin `CALENDAR_PROVIDER`, o con una sesión sin duración, o sin horarios cargados en Sanity: la clienta propone fecha y franja.
- Con calendario, duración y horarios: la clienta elige un turno. Se retiene mientras paga (por defecto 30 minutos) y solo se aceptan medios de pago instantáneos.
- El calendario de Sarah es la fuente de lo ocupado (`freeBusy`) y recibe un evento al confirmarse el pago.

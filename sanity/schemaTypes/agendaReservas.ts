import { defineArrayMember, defineField, defineType } from 'sanity';

const clockPattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const clockField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'string',
    description: 'Hora en formato HH:mm. Ejemplo: 09:30.',
    validation: (rule) => rule.required().regex(clockPattern, { name: 'hora', invert: false }).error('Escribí la hora como HH:mm, por ejemplo 09:30.'),
  });

export const agendaReservas = defineType({
  name: 'agendaReservas',
  title: 'Agenda de reservas',
  type: 'document',
  fields: [
    defineField({
      name: 'ventanas',
      title: 'Horarios de atención',
      type: 'array',
      description: 'Los días y horas en que aceptás sesiones. Si no cargás ninguno, la clienta propone una fecha en lugar de elegir un turno.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'ventana',
          fields: [
            defineField({
              name: 'dia',
              title: 'Día',
              type: 'number',
              options: {
                list: [
                  { title: 'Lunes', value: 1 },
                  { title: 'Martes', value: 2 },
                  { title: 'Miércoles', value: 3 },
                  { title: 'Jueves', value: 4 },
                  { title: 'Viernes', value: 5 },
                  { title: 'Sábado', value: 6 },
                  { title: 'Domingo', value: 7 },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            clockField('desde', 'Desde'),
            clockField('hasta', 'Hasta'),
          ],
          validation: (rule) =>
            rule.custom((value) => {
              const window = value as { desde?: string; hasta?: string } | undefined;
              return window?.desde && window.hasta && window.desde >= window.hasta ? 'La hora de inicio tiene que ser anterior a la de fin.' : true;
            }),
          preview: { select: { title: 'dia', subtitle: 'desde' } },
        }),
      ],
    }),
    defineField({ name: 'pasoMinutos', title: 'Paso entre turnos (minutos)', type: 'number', initialValue: 30, validation: (rule) => rule.required().integer().min(5).max(240) }),
    defineField({ name: 'margenMinutos', title: 'Margen entre sesiones (minutos)', type: 'number', initialValue: 30, validation: (rule) => rule.required().integer().min(0).max(240) }),
    defineField({ name: 'anticipacionHoras', title: 'Anticipación mínima (horas)', type: 'number', initialValue: 48, validation: (rule) => rule.required().integer().min(0) }),
    defineField({ name: 'horizonteDias', title: 'Hasta cuántos días adelante se puede reservar', type: 'number', initialValue: 90, validation: (rule) => rule.required().integer().min(1).max(365) }),
    defineField({
      name: 'retencionMinutos',
      title: 'Retención del turno mientras la clienta paga (minutos)',
      type: 'number',
      initialValue: 30,
      validation: (rule) => rule.required().integer().min(15).max(60),
    }),
    defineField({ name: 'zonaHoraria', title: 'Zona horaria', type: 'string', initialValue: 'America/Argentina/Buenos_Aires', readOnly: true }),
  ],
  preview: { prepare: () => ({ title: 'Agenda de reservas' }) },
});

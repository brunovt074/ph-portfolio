import { defineArrayMember, defineField, defineType } from 'sanity';

export const ajustes = defineType({
  name: 'ajustes',
  title: 'Ajustes generales',
  type: 'document',
  fields: [
    defineField({ name: 'email', title: 'Email de contacto', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'whatsapp', title: 'WhatsApp', type: 'string', description: 'Con código de país. Ejemplo: +54 9 11 1234 5678.', validation: (rule) => rule.required() }),
    defineField({ name: 'instagram', title: 'Cuentas de Instagram', type: 'array', of: [defineArrayMember({ type: 'string' })], description: 'Una por línea, con @.' }),
    defineField({ name: 'frase', title: 'Frase del sitio', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'sobreMi', title: 'Sobre mí', type: 'text', rows: 6, validation: (rule) => rule.required() }),
    defineField({
      name: 'retrato',
      title: 'Retrato de Lara',
      type: 'image',
      options: { hotspot: true, metadata: ['lqip'] },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'retratoAlt', title: 'Descripción del retrato', type: 'string', validation: (rule) => rule.required().min(10).max(160) }),
    defineField({ name: 'statement', title: 'Statement artístico', type: 'text', rows: 8, validation: (rule) => rule.required() }),
    defineField({
      name: 'muestras',
      title: 'Muestras y publicaciones',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'muestra',
          fields: [
            defineField({ name: 'titulo', title: 'Título', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'lugar', title: 'Lugar', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'anio', title: 'Año', type: 'string', validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: 'titulo', subtitle: 'anio' } },
        }),
      ],
    }),
    defineField({
      name: 'infoCopias',
      title: 'Información de las copias de autor',
      type: 'array',
      description: 'Impresión, firma y certificado, envío y enmarcado.',
      of: [defineArrayMember({ type: 'itemInfo' })],
    }),
  ],
  preview: { prepare: () => ({ title: 'Ajustes generales' }) },
});

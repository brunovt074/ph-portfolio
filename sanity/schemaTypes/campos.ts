import { defineArrayMember, defineField } from 'sanity';

export const campoTexto = (name: string, title: string, description?: string) =>
  defineField({ name, title, ...(description && { description }), type: 'string', validation: (rule) => rule.required() });

export const campoParrafo = (name: string, title: string, description?: string) =>
  defineField({ name, title, ...(description && { description }), type: 'text', rows: 3, validation: (rule) => rule.required() });

export const campoTitulo = (name: string, title: string) =>
  defineField({
    name,
    title,
    description: 'Seleccioná una palabra y tocá "Itálica" para destacarla.',
    type: 'tituloConItalica',
    validation: (rule) => rule.required(),
  });

export const campoLista = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    ...(description && { description }),
    type: 'array',
    of: [defineArrayMember({ type: 'string' })],
    validation: (rule) => rule.required().min(1),
  });

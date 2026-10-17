import { defineField } from 'sanity';

export const fotoUnica = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    description,
    type: 'reference',
    to: [{ type: 'foto' }],
    validation: (rule) => rule.required(),
  });

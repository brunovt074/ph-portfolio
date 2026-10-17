import { defineArrayMember, defineField } from 'sanity';

interface PhotoReferencesOptions {
  name: string;
  title: string;
  description: string;
  min?: number;
  max?: number;
}

export const fotoReferencias = ({ name, title, description, min, max }: PhotoReferencesOptions) =>
  defineField({
    name,
    title,
    description,
    type: 'array',
    of: [defineArrayMember({ type: 'reference', to: [{ type: 'foto' }] })],
    validation: (rule) => {
      const withMin = min === undefined ? rule : rule.min(min);
      return max === undefined ? withMin : withMin.max(max);
    },
  });

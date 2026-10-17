import { defineArrayMember, defineType } from 'sanity';

export const tituloConItalica = defineType({
  name: 'tituloConItalica',
  title: 'Título con palabra en itálica',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: 'Normal', value: 'normal' }],
      lists: [],
      marks: { decorators: [{ title: 'Itálica', value: 'em' }], annotations: [] },
    }),
  ],
});

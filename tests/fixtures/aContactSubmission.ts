import type { ContactSubmission } from '@/application/inputs/ContactSubmission';

export const aContactSubmission = (overrides: Partial<ContactSubmission> = {}): ContactSubmission => ({
  name: 'Sofía Paredes',
  email: 'sofia@marca.com',
  type: 'Marca / producto',
  message: 'Necesito fotos de producto para el lanzamiento de mi tienda online.',
  copy: '',
  website: '',
  locale: 'es',
  ...overrides,
});

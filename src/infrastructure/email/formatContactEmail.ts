import type { ContactMessage } from '@/domain/ContactMessage';
import type { FormattedEmail } from './FormattedEmail';

const NO_TYPE_LABEL = 'Consulta general';

const singleLine = (value: string): string => value.replace(/\s+/g, ' ').trim();

export const formatContactEmail = (message: ContactMessage): FormattedEmail => {
  const type = message.type || NO_TYPE_LABEL;
  const lines = [
    `Nombre: ${message.name}`,
    `Email: ${message.email}`,
    `Tipo de trabajo: ${type}`,
    ...(message.copy ? [`Copia consultada: ${message.copy}`] : []),
    '',
    message.message,
  ];
  return { subject: `Nueva consulta: ${singleLine(type)} — ${singleLine(message.name)}`, text: lines.join('\n') };
};

import type { ContactMessage } from '@/domain/ContactMessage';
import type { FormattedEmail } from './FormattedEmail';

const NO_TYPE_LABEL = 'Consulta general';

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
  return { subject: `Nueva consulta: ${type} — ${message.name}`, text: lines.join('\n') };
};

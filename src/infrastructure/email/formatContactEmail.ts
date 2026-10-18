import type { ContactMessage } from '@/domain/ContactMessage';
import { contactLanguageLabels } from './contactLanguageLabels';
import type { FormattedEmail } from './FormattedEmail';
import { singleLine } from './singleLine';

const NO_TYPE_LABEL = 'Consulta general';

export const formatContactEmail = (message: ContactMessage): FormattedEmail => {
  const type = message.type || NO_TYPE_LABEL;
  const lines = [
    `Nombre: ${message.name}`,
    `Email: ${message.email}`,
    `Tipo de trabajo: ${type}`,
    `Idioma: ${contactLanguageLabels[message.locale]}`,
    ...(message.copy ? [`Copia consultada: ${message.copy}`] : []),
    '',
    message.message,
  ];
  return { subject: `Nueva consulta: ${singleLine(type)} — ${singleLine(message.name)}`, text: lines.join('\n') };
};

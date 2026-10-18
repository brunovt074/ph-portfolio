import { formatText } from '@/domain/formatText';
import type { SiteTexts } from '@/domain/SiteTexts';

export const preselectContactForm = (form: HTMLFormElement): void => {
  const params = new URLSearchParams(location.search);
  const tipos: Record<string, string> = JSON.parse(form.dataset.tipos ?? '{}');
  const messages = JSON.parse(form.dataset.messages ?? '{}') as SiteTexts['contact'];
  const tipo = params.get('tipo');
  const copia = params.get('copia');
  const typeSelect = form.querySelector<HTMLSelectElement>('select[name="tipo"]');
  const copySelect = form.querySelector<HTMLSelectElement>('select[name="copia"]');
  const message = form.querySelector<HTMLTextAreaElement>('textarea[name="mensaje"]');
  if (tipo && typeSelect && Object.hasOwn(tipos, tipo)) {
    typeSelect.value = tipos[tipo] ?? '';
  }
  if (copia && copySelect) {
    copySelect.value = copia;
    if (copySelect.value === copia && message && !message.value) {
      message.value = formatText(messages.copyMessage, { copy: copia });
    }
  }
};

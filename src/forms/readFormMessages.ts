import type { SiteTexts } from '@/domain/SiteTexts';

export const readFormMessages = (form: HTMLFormElement): SiteTexts['contact'] =>
  JSON.parse(form.dataset.messages ?? '{}') as SiteTexts['contact'];

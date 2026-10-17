import type { Locale } from '@/domain/Locale';
import type { SiteTexts } from '@/domain/SiteTexts';
import { enTexts } from './enTexts';
import { esTexts } from './esTexts';
import { ptTexts } from './ptTexts';

export const defaultSiteTexts: Record<Locale, SiteTexts> = { es: esTexts, en: enTexts, pt: ptTexts };

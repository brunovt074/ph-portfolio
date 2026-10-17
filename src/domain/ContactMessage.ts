import type { Locale } from './Locale';

export interface ContactMessage { name: string; email: string; type: string; message: string; copy: string; locale: Locale }

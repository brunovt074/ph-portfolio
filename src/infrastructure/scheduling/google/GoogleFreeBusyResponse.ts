import type { GoogleBusyInterval } from './GoogleBusyInterval';

export interface GoogleFreeBusyResponse {
  calendars?: Record<string, { busy?: GoogleBusyInterval[]; errors?: { reason?: string }[] }>;
}

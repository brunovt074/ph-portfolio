import { JWT } from 'google-auth-library';
import type { CalendarProvider } from '@/domain/scheduling/CalendarProvider';
import { CalendarConfigurationError } from './CalendarConfigurationError';
import type { CalendarProviderConfig } from './CalendarProviderConfig';
import { FetchGoogleCalendarApi } from './google/FetchGoogleCalendarApi';
import { GoogleCalendarProvider } from './google/GoogleCalendarProvider';
import { SimulatedCalendarProvider } from './simulated/SimulatedCalendarProvider';

const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';

export const createCalendarProvider = ({
  provider,
  calendarId,
  serviceAccountEmail,
  serviceAccountPrivateKey,
  timeZone,
}: CalendarProviderConfig): CalendarProvider | null => {
  if (provider === 'simulado') {
    console.warn('[calendar] modo simulado activo: no usar en producción');
    return new SimulatedCalendarProvider();
  }
  if (provider !== 'google') {
    return null;
  }
  const missing = [
    calendarId ? '' : 'GOOGLE_CALENDAR_ID',
    serviceAccountEmail ? '' : 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    serviceAccountPrivateKey ? '' : 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
  ].filter(Boolean);
  if (missing.length > 0) {
    throw new CalendarConfigurationError(missing);
  }
  const auth = new JWT({ email: serviceAccountEmail as string, key: (serviceAccountPrivateKey as string).replace(/\\n/g, '\n'), scopes: [GOOGLE_CALENDAR_SCOPE] });
  return new GoogleCalendarProvider(new FetchGoogleCalendarApi(auth), calendarId as string, timeZone);
};

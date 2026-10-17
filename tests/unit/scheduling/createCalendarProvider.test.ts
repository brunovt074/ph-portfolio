import { afterEach, describe, expect, it, vi } from 'vitest';
import { CalendarConfigurationError } from '@/infrastructure/scheduling/CalendarConfigurationError';
import { createCalendarProvider } from '@/infrastructure/scheduling/createCalendarProvider';
import { GoogleCalendarProvider } from '@/infrastructure/scheduling/google/GoogleCalendarProvider';
import { SimulatedCalendarProvider } from '@/infrastructure/scheduling/simulated/SimulatedCalendarProvider';

const base = {
  provider: undefined,
  calendarId: undefined,
  serviceAccountEmail: undefined,
  serviceAccountPrivateKey: undefined,
  timeZone: 'America/Argentina/Buenos_Aires',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createCalendarProvider', () => {
  it('has no calendar by default so the client proposes a date', () => {
    expect(createCalendarProvider(base)).toBeNull();
    expect(createCalendarProvider({ ...base, provider: 'cal.com' })).toBeNull();
  });

  it('uses the simulated calendar and warns that it is not for production', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(createCalendarProvider({ ...base, provider: 'simulado' })).toBeInstanceOf(SimulatedCalendarProvider);
    expect(warn).toHaveBeenCalledWith('[calendar] modo simulado activo: no usar en producción');
  });

  it('uses Google Calendar when the service account is fully configured', () => {
    const provider = createCalendarProvider({
      ...base,
      provider: 'google',
      calendarId: 'agenda',
      serviceAccountEmail: 'sitio@proyecto.iam.gserviceaccount.com',
      serviceAccountPrivateKey: '-----BEGIN PRIVATE KEY-----\\nabc\\n-----END PRIVATE KEY-----\\n',
    });

    expect(provider).toBeInstanceOf(GoogleCalendarProvider);
  });

  it('refuses to start Google Calendar listing every variable that is missing', () => {
    expect(() => createCalendarProvider({ ...base, provider: 'google' })).toThrow(
      new CalendarConfigurationError(['GOOGLE_CALENDAR_ID', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY']),
    );
  });

  it('names only the variable that is missing', () => {
    expect(() =>
      createCalendarProvider({ ...base, provider: 'google', calendarId: 'agenda', serviceAccountEmail: 'a@b.c' }),
    ).toThrow('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
  });
});

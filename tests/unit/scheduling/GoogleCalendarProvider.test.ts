import { describe, expect, it } from 'vitest';
import { CalendarUnavailableError } from '@/domain/scheduling/CalendarUnavailableError';
import { GoogleCalendarProvider } from '@/infrastructure/scheduling/google/GoogleCalendarProvider';
import { FakeGoogleCalendarApi } from '../../fakes/FakeGoogleCalendarApi';

const zone = 'America/Argentina/Buenos_Aires';
const range = { start: new Date('2026-10-22T03:00:00Z'), end: new Date('2026-10-23T03:00:00Z') };
const event = {
  bookingId: 'booking-1',
  start: new Date('2026-10-22T13:00:00Z'),
  end: new Date('2026-10-22T14:30:00Z'),
  title: 'Reserva: Maternidad — Camila Ríos',
  description: 'Email: camila@example.com',
};

describe('GoogleCalendarProvider', () => {
  it('asks Google which ranges Sarah has busy in her calendar', async () => {
    const api = new FakeGoogleCalendarApi({
      calendars: { 'sarah@group.calendar.google.com': { busy: [{ start: '2026-10-22T18:00:00Z', end: '2026-10-22T22:00:00Z' }] } },
    });

    const busy = await new GoogleCalendarProvider(api, 'sarah@group.calendar.google.com', zone).busy(range);

    expect(busy).toEqual([{ start: new Date('2026-10-22T18:00:00Z'), end: new Date('2026-10-22T22:00:00Z') }]);
    expect(api.freeBusyBodies).toEqual([
      {
        timeMin: '2026-10-22T03:00:00.000Z',
        timeMax: '2026-10-23T03:00:00.000Z',
        timeZone: zone,
        items: [{ id: 'sarah@group.calendar.google.com' }],
      },
    ]);
  });

  it('a calendar with nothing busy has no ranges', async () => {
    const api = new FakeGoogleCalendarApi({ calendars: { agenda: {} } });

    expect(await new GoogleCalendarProvider(api, 'agenda', zone).busy(range)).toEqual([]);
  });

  it('fails when Google does not answer for the calendar', async () => {
    await expect(new GoogleCalendarProvider(new FakeGoogleCalendarApi({}), 'agenda', zone).busy(range)).rejects.toBeInstanceOf(CalendarUnavailableError);
    await expect(new GoogleCalendarProvider(new FakeGoogleCalendarApi({ calendars: {} }), 'agenda', zone).busy(range)).rejects.toBeInstanceOf(
      CalendarUnavailableError,
    );
  });

  it('fails when Google reports errors for the calendar, for example because it is not shared', async () => {
    const api = new FakeGoogleCalendarApi({ calendars: { agenda: { errors: [{ reason: 'notFound' }] } } });

    await expect(new GoogleCalendarProvider(api, 'agenda', zone).busy(range)).rejects.toThrow('freeBusy returned no data');
  });

  it('creates the event without attendees and links it to the booking', async () => {
    const api = new FakeGoogleCalendarApi();

    const id = await new GoogleCalendarProvider(api, 'agenda', zone).createEvent(event);

    expect(id).toBe('google-event-1');
    expect(api.inserted).toEqual([
      {
        calendarId: 'agenda',
        body: {
          summary: 'Reserva: Maternidad — Camila Ríos',
          description: 'Email: camila@example.com',
          start: { dateTime: '2026-10-22T13:00:00.000Z', timeZone: zone },
          end: { dateTime: '2026-10-22T14:30:00.000Z', timeZone: zone },
          extendedProperties: { private: { bookingId: 'booking-1' } },
        },
      },
    ]);
    expect(api.inserted[0]?.body).not.toHaveProperty('attendees');
  });

  it('fails when Google does not return the id of the created event', async () => {
    const api = new FakeGoogleCalendarApi({}, {});

    await expect(new GoogleCalendarProvider(api, 'agenda', zone).createEvent(event)).rejects.toBeInstanceOf(CalendarUnavailableError);
  });

  it('deletes an event of the calendar', async () => {
    const api = new FakeGoogleCalendarApi();

    await new GoogleCalendarProvider(api, 'agenda', zone).deleteEvent('google-event-1');

    expect(api.deleted).toEqual([{ calendarId: 'agenda', eventId: 'google-event-1' }]);
  });

  it('identifies itself as google', () => {
    expect(new GoogleCalendarProvider(new FakeGoogleCalendarApi(), 'agenda', zone).provider).toBe('google');
  });
});

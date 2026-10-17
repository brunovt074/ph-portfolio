import { describe, expect, it } from 'vitest';
import { buildIcsEvent } from '@/infrastructure/email/buildIcsEvent';

const event = (overrides = {}) => ({
  bookingId: 'booking-1',
  start: new Date('2026-10-22T13:00:00Z'),
  end: new Date('2026-10-22T14:30:00Z'),
  stamp: new Date('2026-10-17T15:00:00.123Z'),
  summary: 'Maternidad con Lara Vischi',
  description: 'Reserva booking-1',
  ...overrides,
});

describe('buildIcsEvent', () => {
  it('builds a calendar file the client can open in any calendar app', () => {
    expect(buildIcsEvent(event())).toBe(
      [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Lara Vischi//Reservas//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:booking-1@laravischi',
        'DTSTAMP:20261017T150000Z',
        'DTSTART:20261022T130000Z',
        'DTEND:20261022T143000Z',
        'SUMMARY:Maternidad con Lara Vischi',
        'DESCRIPTION:Reserva booking-1',
        'END:VEVENT',
        'END:VCALENDAR',
        '',
      ].join('\r\n'),
    );
  });

  it('escapes commas, semicolons, backslashes and line breaks in the text', () => {
    const ics = buildIcsEvent(event({ summary: 'Retrato, familia; \\ amigos', description: 'Línea uno\nLínea dos' }));

    expect(ics).toContain('SUMMARY:Retrato\\, familia\; \\\\ amigos\r\n');
    expect(ics).toContain('DESCRIPTION:Línea uno\\nLínea dos\r\n');
  });

  it('folds lines longer than 75 octets and never splits an accented character', () => {
    const ics = buildIcsEvent(event({ description: 'ñ'.repeat(120) }));

    const lines = ics.split('\r\n');
    const start = lines.findIndex((line) => line.startsWith('DESCRIPTION:'));
    expect(lines[start + 1]?.startsWith(' ')).toBe(true);
    lines.forEach((line) => expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75));
    expect(ics.replace(/\r\n /g, '')).toContain(`DESCRIPTION:${'ñ'.repeat(120)}`);
  });
});

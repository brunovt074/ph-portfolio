import type { IcsEventInput } from './IcsEventInput';

const MAX_LINE_OCTETS = 75;

const toUtcStamp = (instant: Date): string => instant.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

const escapeText = (value: string): string => value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

const fold = (line: string): string => {
  const chunks: string[] = [];
  let current = '';
  let octets = 0;
  for (const character of line) {
    const size = Buffer.byteLength(character);
    const limit = chunks.length === 0 ? MAX_LINE_OCTETS : MAX_LINE_OCTETS - 1;
    if (octets + size > limit) {
      chunks.push(current);
      current = '';
      octets = 0;
    }
    current += character;
    octets += size;
  }
  chunks.push(current);
  return chunks.join('\r\n ');
};

export const buildIcsEvent = ({ bookingId, start, end, stamp, summary, description }: IcsEventInput): string =>
  [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sarah Moreau//Reservas//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${bookingId}@sarahmoreau`,
    `DTSTAMP:${toUtcStamp(stamp)}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .map(fold)
    .join('\r\n')
    .concat('\r\n');

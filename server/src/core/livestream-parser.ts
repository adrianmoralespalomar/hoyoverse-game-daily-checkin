import type { Livestream } from '../models/livestream.interface.ts';
import { LIVESTREAM_ANNOUNCEMENT_PATTERN } from '../models/livestream-announcement-pattern.const.ts';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

/** El directo que anuncia una noticia, o `null` si no trae la fecha en el formato esperado. */
export function parseLivestream(subject: string, description: string): Livestream | null {
  const match = LIVESTREAM_ANNOUNCEMENT_PATTERN.exec(description);
  if (!match) return null;
  const [, month, day, year, hour12, minutes, meridiem, offsetHours, offsetMinutes = '0'] = match;
  const hour = Number(hour12) % 12 + (meridiem.toUpperCase() === 'PM' ? 12 : 0);
  const offsetMs = Math.sign(Number(offsetHours) || 1) * (Math.abs(Number(offsetHours)) * HOUR_MS + Number(offsetMinutes) * MINUTE_MS);
  const startsAt = Date.UTC(Number(year), Number(month) - 1, Number(day), hour, Number(minutes)) - offsetMs;
  return { subject, version: /\d+\.\d+/.exec(subject)?.[0] ?? null, startsAt: new Date(startsAt).toISOString() };
}

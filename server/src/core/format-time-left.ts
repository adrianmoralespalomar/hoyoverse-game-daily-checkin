import { DAY_MS } from '../models/day-ms.const.ts';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

const pluralize = (count: number, singular: string, plural: string): string => `${count} ${count === 1 ? singular : plural}`;

/** "1 día y 3 horas", "5 horas" o "20 minutos". Con días muestra días y horas; con horas, solo horas. */
export function formatTimeLeft(ms: number): string {
  const days = Math.floor(ms / DAY_MS);
  const hours = Math.floor(ms % DAY_MS / HOUR_MS);
  if (days) return hours ? `${pluralize(days, 'día', 'días')} y ${pluralize(hours, 'hora', 'horas')}` : pluralize(days, 'día', 'días');
  if (hours) return pluralize(hours, 'hora', 'horas');
  return pluralize(Math.max(1, Math.floor(ms / MINUTE_MS)), 'minuto', 'minutos');
}

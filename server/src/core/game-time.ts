import type { GameVersion } from '../models/game-version.interface.ts';
import { GAME_CALENDAR } from '../models/game-calendar.const.ts';
import type { ServerDateTime } from '../models/server-date-time.interface.ts';

/** Segundos Unix (número o texto) → ISO. `null` si es 0 o no viene (HoYoLAB usa `"0"` para "sin fin"). */
export function unixSecondsToIso(seconds: string | number | undefined): string | null {
  const value = Number(seconds ?? 0);
  return value > 0 ? new Date(value * 1000).toISOString() : null;
}

/** Fecha por partes del servidor de Europa → ISO. No usa la zona del contenedor (Madrid cambia de hora). */
export function serverTimeToIso({ year, month, day, hour, minute, second = 0 }: ServerDateTime): string {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second) - GAME_CALENDAR.euServerUtcOffsetMs).toISOString();
}

/** `YYYY-MM-DD hh:mm:ss` del servidor de Europa (diario, historial de tiradas) → ISO. */
export function serverTimeTextToIso(text: string): string {
  const [year, month, day, hour, minute, second] = text.split(/[-: ]/).map(Number);
  return serverTimeToIso({ year, month, day, hour, minute, second });
}

/**
 * La versión sale de las fechas de sus banners. Si solo se ve media versión, el otro extremo se calcula con las 6
 * semanas que dura: `isSecondHalf` dice si lo que se ve es la segunda mitad (entonces lo que se sabe es el final).
 */
export function deriveGameVersion(name: string, pools: { startsAt: string; endsAt: string }[], isSecondHalf: boolean): GameVersion | null {
  if (!pools.length) return null;
  const startsAt = Math.min(...pools.map(pool => Date.parse(pool.startsAt)));
  const endsAt = Math.max(...pools.map(pool => Date.parse(pool.endsAt)));
  if (endsAt - startsAt >= GAME_CALENDAR.minFullVersionMs) return { name, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(endsAt).toISOString(), estimatedEdge: null };
  return isSecondHalf
    ? { name, startsAt: new Date(endsAt - GAME_CALENDAR.versionLengthMs).toISOString(), endsAt: new Date(endsAt).toISOString(), estimatedEdge: 'start' }
    : { name, startsAt: new Date(startsAt).toISOString(), endsAt: new Date(startsAt + GAME_CALENDAR.versionLengthMs).toISOString(), estimatedEdge: 'end' };
}

/** Meses (`YYYYMM`, hora del servidor) que tocan el periodo, del primero al último. */
export function serverMonthKeysBetween(startMs: number, endMs: number): string[] {
  const start = new Date(startMs + GAME_CALENDAR.euServerUtcOffsetMs);
  const end = new Date(endMs + GAME_CALENDAR.euServerUtcOffsetMs);
  const keys: string[] = [];
  for (const month = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth())); month <= end; month.setUTCMonth(month.getUTCMonth() + 1)) {
    keys.push(`${month.getUTCFullYear()}${String(month.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

/** Cuándo acaba un mes (`YYYYMM`) en la hora del servidor. */
export function serverMonthEndMs(monthKey: string): number {
  return Date.UTC(Number(monthKey.slice(0, 4)), Number(monthKey.slice(4))) - GAME_CALENDAR.euServerUtcOffsetMs;
}

/** Lo que queda por ganar si la recompensa fuera proporcional al progreso. `null` si falta algún dato. */
export function estimateCurrencyLeft(currencyTotal: number | null, progress: number | null): number | null {
  if (currencyTotal === null || progress === null) return null;
  return Math.round(currencyTotal * (1 - Math.min(progress, 1)));
}

import { HOYOLAB_UTC_OFFSET_MS } from '../models/hoyolab-utc-offset-ms.const';

/** Espejo de `server/src/core/hoyolab-day.ts`: el día de HoYoLAB cambia a medianoche UTC+8. */
export function getHoyolabDayKey(isoDate: string): string {
  return new Date(Date.parse(isoDate) + HOYOLAB_UTC_OFFSET_MS).toISOString().slice(0, 10);
}

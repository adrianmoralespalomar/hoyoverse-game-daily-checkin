import { HOYOLAB_UTC_OFFSET_MS } from '../models/hoyolab-utc-offset-ms.const.ts';

/** Día de HoYoLAB (`YYYY-MM-DD`): cambia a medianoche UTC+8, no a la de Madrid. */
export function getHoyolabDayKey(date: Date = new Date()): string {
  return new Date(date.getTime() + HOYOLAB_UTC_OFFSET_MS).toISOString().slice(0, 10);
}

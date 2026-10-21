import { formatDate } from '@angular/common';
import type { GameNotes } from '../models/game-notes.interface';
import type { NoteMeter } from '../models/note-meter.interface';

/** Energía que tienes ahora: el NAS consulta cada 20 min y entre medias se calcula con la hora en que se llena. */
export function estimateStamina({ stamina }: GameNotes, now: number): number {
  if (!stamina.fullAt) return Math.max(stamina.current, stamina.max);
  const secondsLeft = (Date.parse(stamina.fullAt) - now) / 1000;
  if (secondsLeft <= 0) return stamina.max;
  return Math.max(stamina.current, stamina.max - Math.ceil(secondsLeft / stamina.regenSeconds));
}

export function isMeterFull(meter: NoteMeter, now: number): boolean {
  return meter.current >= meter.max || (!!meter.fullAt && Date.parse(meter.fullAt) <= now);
}

/** "13 h 45 min", "25 min" o "menos de 1 min". */
export function formatTimeLeft(isoDate: string, now: number): string {
  const minutes = Math.ceil((Date.parse(isoDate) - now) / 60_000);
  if (minutes <= 1) return 'menos de 1 min';
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours} h ${minutes % 60} min` : `${minutes} min`;
}

/** "hoy a las 23:40" o "mañana a las 7:43" (hora de este navegador). */
export function formatReadyTime(isoDate: string, now: number): string {
  const date = new Date(isoDate);
  const isToday = date.toDateString() === new Date(now).toDateString();
  const dayText = isToday ? 'hoy' : date.toDateString() === new Date(now + 86_400_000).toDateString() ? 'mañana' : formatDate(date, 'EEEE', 'es');
  return `${dayText} a las ${formatDate(date, 'H:mm', 'es')}`;
}

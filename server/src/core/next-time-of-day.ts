/** Próxima vez que el reloj marca `HH:mm` (hora del servidor, la de Madrid), desde `now`. */
export function getNextTimeOfDayMs(time: string, now: number): number {
  const [hours, minutes] = time.split(':').map(Number);
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next.getTime() <= now) next.setDate(next.getDate() + 1);
  return next.getTime();
}

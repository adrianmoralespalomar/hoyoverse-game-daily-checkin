/** "quedan 13 días", "queda 1 día", "quedan 5 h" o "acaba en menos de 1 h". */
export function formatDaysLeft(isoDate: string, now: number): string {
  const hours = Math.floor((Date.parse(isoDate) - now) / 3_600_000);
  if (hours < 1) return 'acaba en menos de 1 h';
  if (hours < 24) return `quedan ${hours} h`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'queda 1 día' : `quedan ${days} días`;
}

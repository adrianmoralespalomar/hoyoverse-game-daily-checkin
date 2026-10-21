import type { CookieHealth } from './cookie-health.type';

export const COOKIE_HEALTH_LABELS: Record<CookieHealth, string> = {
  missing: 'No está en el .env',
  unknown: 'Sin probar todavía',
  ok: 'Funciona',
  expired: 'Caducada: cópiala de nuevo',
};

import type { CookieKind } from './cookie-kind.type';

/** Qué cookie es cada una y de dónde se saca (los pasos están en el README). */
export const COOKIE_DESCRIPTIONS: Record<CookieKind, { name: string; envVariable: string; source: string }> = {
  checkIn: { name: 'Check-in', envVariable: 'HOYOLAB_COOKIE', source: 'hoyolab.com' },
  redeem: { name: 'Canje de códigos', envVariable: 'HOYOVERSE_REDEEM_COOKIE', source: 'la web de canje de cualquier juego' },
};

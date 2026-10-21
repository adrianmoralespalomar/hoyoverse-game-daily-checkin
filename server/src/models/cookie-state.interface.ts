import type { CookieHealth } from './cookie-health.type.ts';

export interface CookieState {
  health: CookieHealth;
  checkedAt?: string;
  /** Huella de la cookie a la que se refiere: si cambias la del `.env`, el estado vuelve a `unknown`. */
  fingerprint?: string;
}

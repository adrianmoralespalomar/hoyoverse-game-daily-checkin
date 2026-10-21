import type { CookieKind } from './cookie-kind.type.ts';
import type { CookieState } from './cookie-state.interface.ts';
import type { GameDashboard } from './game-dashboard.interface.ts';

/** Todo lo que pinta el panel. Su espejo está en `web/src/app/models/dashboard.interface.ts`. */
export interface Dashboard {
  /** Día de HoYoLAB (UTC+8), `YYYY-MM-DD`. */
  hoyolabDay: string;
  isBusy: boolean;
  /** Hora del check-in diario (`HH:mm`), elegida en el panel. */
  checkInTimeLabel: string;
  cookies: Record<CookieKind, Omit<CookieState, 'fingerprint'>>;
  /** Fallos de configuración del `.env`. */
  problems: string[];
  games: GameDashboard[];
}

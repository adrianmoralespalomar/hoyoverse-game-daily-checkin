import type { AlertRuleView } from './alert-rule-view.interface';
import type { AppAlert } from './app-alert.interface';
import type { CookieHealth } from './cookie-health.type';
import type { CookieKind } from './cookie-kind.type';
import type { GameDashboard } from './game-dashboard.interface';

/** Espejo de `server/src/models/dashboard.interface.ts`. */
export interface Dashboard {
  hoyolabDay: string;
  isBusy: boolean;
  checkInTimeLabel: string;
  wakeUpTimeLabel: string;
  cookies: Record<CookieKind, { health: CookieHealth; checkedAt?: string }>;
  problems: string[];
  games: GameDashboard[];
  alerts: AppAlert[];
  alertRules: AlertRuleView[];
}

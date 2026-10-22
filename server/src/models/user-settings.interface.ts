import type { GameId } from './game-id.type.ts';
import type { IncomeExtras } from './income-extras.interface.ts';

/** Ajustes que se cambian desde el panel. Se guardan en `data/settings.json`. */
export interface UserSettings {
  /** Hora de Madrid del check-in diario, `HH:mm`. */
  checkInTime: string;
  /** Hora de Madrid a la que te despiertas, `HH:mm`. */
  wakeUpTime: string;
  /** Tiradas que da cada versión a un F2P, apuntadas a mano desde las hojas de la comunidad. Por juego y versión. */
  f2pPullsByVersion: Partial<Record<GameId, Record<string, number>>>;
  /** Bendición/pase mensual y pase de batalla que tiene cada juego. Lo que falte se toma de `DEFAULT_INCOME_EXTRAS`. */
  incomeExtras: Partial<Record<GameId, Partial<IncomeExtras>>>;
  /** Reglas de avisos apagadas desde el panel. */
  disabledAlertRuleIds: string[];
}

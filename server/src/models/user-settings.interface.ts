import type { GameId } from './game-id.type.ts';

/** Ajustes que se cambian desde el panel. Se guardan en `data/settings.json`. */
export interface UserSettings {
  /** Hora de Madrid del check-in diario, `HH:mm`. */
  checkInTime: string;
  /** Tiradas que da cada versión a un F2P, apuntadas a mano desde las hojas de la comunidad. Por juego y versión. */
  f2pPullsByVersion: Partial<Record<GameId, Record<string, number>>>;
}

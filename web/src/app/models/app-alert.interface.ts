import type { AlertSeverity } from './alert-severity.type';
import type { GameId } from './game-id.type';

/** Espejo de `server/src/models/app-alert.interface.ts`. */
export interface AppAlert {
  id: string;
  gameId: GameId | null;
  severity: AlertSeverity;
  title: string;
  message: string;
  href?: string;
}

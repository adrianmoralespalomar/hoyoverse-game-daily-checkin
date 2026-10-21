import type { GameId } from './game-id.type.ts';

/** Configuración leída del `.env`. Los fallos no tumban el daemon: van en `problems` y el panel los enseña. */
export interface AppSettings {
  checkInCookie: string | null;
  redeemCookie: string | null;
  gameIds: GameId[];
  checkInLanguage: string;
  startJitterMs: number;
  problems: string[];
}

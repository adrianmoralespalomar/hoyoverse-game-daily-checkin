import type { EndgameMode } from './endgame-mode.interface.ts';
import type { GameBanner } from './game-banner.interface.ts';
import type { GameVersion } from './game-version.interface.ts';
import type { PendingEvent } from './pending-event.interface.ts';

/** Versión, banners, contenido final y eventos de un juego, sacados del calendario y la Crónica de batalla. */
export interface GameProgress {
  fetchedAt: string;
  version: GameVersion | null;
  /** Solo los que están activos ahora. */
  banners: GameBanner[];
  endgame: EndgameMode[];
  /** Eventos activos sin completar que dan moneda de tiradas. */
  pendingEvents: PendingEvent[];
}

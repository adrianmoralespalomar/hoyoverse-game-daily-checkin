import type { EndgameMode } from './endgame-mode.interface';
import type { GameBanner } from './game-banner.interface';
import type { GameVersion } from './game-version.interface';
import type { PendingEvent } from './pending-event.interface';

/** Espejo de `server/src/models/game-progress.interface.ts`. */
export interface GameProgress {
  fetchedAt: string;
  version: GameVersion | null;
  banners: GameBanner[];
  endgame: EndgameMode[];
  pendingEvents: PendingEvent[];
}

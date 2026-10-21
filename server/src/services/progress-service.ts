import { readDataFile, writeDataFile } from '../core/data-file-store.ts';
import { log } from '../core/log.ts';
import { waitRandomly } from '../core/pacing.ts';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';
import type { GameDashboard } from '../models/game-dashboard.interface.ts';
import type { GameId } from '../models/game-id.type.ts';
import type { GameModule } from '../models/game-module.interface.ts';
import type { GameProgressState } from '../models/game-progress-state.interface.ts';
import type { GameVersion } from '../models/game-version.interface.ts';
import { REQUEST_PACING } from '../models/request-pacing.const.ts';
import type { CookieStateStore } from './cookie-state-store.ts';

/** Versión, banners, contenido final y eventos de cada juego. Solo lee. Se guarda en `data/progress.json`. */
export class ProgressService {
  #states: Partial<Record<GameId, GameProgressState>> = readDataFile(DATA_FILE_NAMES.progress, {});
  #games: GameModule[];
  #cookies: CookieStateStore;

  constructor(games: GameModule[], cookies: CookieStateStore) {
    this.#games = games.filter(game => game.fetchProgress);
    this.#cookies = cookies;
  }

  async refresh(): Promise<void> {
    if (!this.#cookies.isUsable('checkIn')) return;
    for (const [index, game] of this.#games.entries()) {
      if (index > 0) await waitRandomly(REQUEST_PACING.betweenCheckInsMs);
      try {
        this.#states[game.id] = { progress: await game.fetchProgress!() };
      } catch (error) {
        this.#states[game.id] = { ...this.#states[game.id], error: (error as Error).message, errorAt: new Date().toISOString() };
        log('ERROR', `${game.name}: no se pudo leer el calendario ni el contenido final (${(error as Error).message})`);
      }
    }
    writeDataFile(DATA_FILE_NAMES.progress, this.#states);
  }

  getVersion(gameId: GameId): GameVersion | null {
    return this.#states[gameId]?.progress?.version ?? null;
  }

  getView(game: GameModule): GameDashboard['progress'] {
    if (!game.fetchProgress) return game.notesDisabledReason ? { disabledReason: game.notesDisabledReason } : null;
    const { progress, error } = this.#states[game.id] ?? {};
    return { progress, error };
  }
}

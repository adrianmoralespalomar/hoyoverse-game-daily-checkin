import { readDataFile, writeDataFile } from '../core/data-file-store.ts';
import { log } from '../core/log.ts';
import { waitRandomly } from '../core/pacing.ts';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';
import type { GameDashboard } from '../models/game-dashboard.interface.ts';
import type { GameId } from '../models/game-id.type.ts';
import type { GameModule } from '../models/game-module.interface.ts';
import type { GameNotesState } from '../models/game-notes-state.interface.ts';
import { REQUEST_PACING } from '../models/request-pacing.const.ts';
import type { CookieStateStore } from './cookie-state-store.ts';

/** Resina y energía de cada juego. Solo lee: no hace nada en tu cuenta. Se guarda en `data/notes.json`. */
export class NotesService {
  #states: Partial<Record<GameId, GameNotesState>> = readDataFile(DATA_FILE_NAMES.notes, {});
  #games: GameModule[];
  #cookies: CookieStateStore;

  constructor(games: GameModule[], cookies: CookieStateStore) {
    this.#games = games.filter(game => game.fetchNotes);
    this.#cookies = cookies;
  }

  async refresh(): Promise<void> {
    if (!this.#cookies.isUsable('checkIn')) return;
    for (const [index, game] of this.#games.entries()) {
      if (index > 0) await waitRandomly(REQUEST_PACING.betweenCheckInsMs);
      const state: GameNotesState = this.#states[game.id] ?? {};
      try {
        this.#states[game.id] = { notes: await game.fetchNotes!() };
      } catch (error) {
        this.#states[game.id] = { ...state, error: (error as Error).message, errorAt: new Date().toISOString() };
        log('ERROR', `${game.name}: no se pudieron leer la resina y la energía (${(error as Error).message})`);
      }
    }
    writeDataFile(DATA_FILE_NAMES.notes, this.#states);
  }

  getView(game: GameModule): GameDashboard['notes'] {
    if (!game.fetchNotes) return game.notesDisabledReason ? { disabledReason: game.notesDisabledReason } : null;
    const { notes, error } = this.#states[game.id] ?? {};
    return { notes, error };
  }
}

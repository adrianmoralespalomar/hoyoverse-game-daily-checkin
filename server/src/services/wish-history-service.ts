import { readDataFile, writeDataFile } from '../core/data-file-store.ts';
import { log } from '../core/log.ts';
import { summarizeWishBanners } from '../core/wish-summary.ts';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';
import { GACHA_LOG_PACING } from '../models/gacha-log-pacing.const.ts';
import { GACHA_LOG_RETCODE_MESSAGES } from '../models/gacha-log-retcode-messages.const.ts';
import type { GameDashboard } from '../models/game-dashboard.interface.ts';
import type { GameId } from '../models/game-id.type.ts';
import type { GameModule } from '../models/game-module.interface.ts';
import type { GameVersion } from '../models/game-version.interface.ts';
import type { GameWishesState } from '../models/game-wishes-state.interface.ts';

/**
 * Historial de tiradas. Se pega el enlace del historial del juego (dura 24 horas); la `authkey` se queda solo en
 * memoria para traer las tiradas nuevas cada hora mientras valga. Las tiradas se guardan en `data/wishes.json`.
 */
export class WishHistoryService {
  #states: Partial<Record<GameId, GameWishesState>> = readDataFile(DATA_FILE_NAMES.wishes, {});
  #authkeys = new Map<GameId, { authkey: string; savedAt: number }>();
  #importingGameIds = new Set<GameId>();
  #games: GameModule[];

  constructor(games: GameModule[]) {
    this.#games = games.filter(game => game.wishHistory);
  }

  /** Reconoce el juego y guarda la `authkey`. Lanza si el enlace no sirve. La descarga va aparte (`importWishes`). */
  saveLink(link: unknown): GameModule {
    if (typeof link !== 'string') throw new Error('Pega el enlace del historial');
    const authkey = readAuthkey(link);
    const game = this.#games.find(({ wishHistory }) => wishHistory!.matchesLink(link));
    if (!game) throw new Error('El enlace no es del historial de Genshin, Star Rail ni ZZZ (o ese juego no está activo)');
    this.#authkeys.set(game.id, { authkey, savedAt: Date.now() });
    this.#importingGameIds.add(game.id);
    return game;
  }

  /** Trae las tiradas nuevas de un juego con su enlace guardado. No lanza: el error queda en el estado. */
  async importWishes(game: GameModule): Promise<void> {
    const saved = this.#authkeys.get(game.id);
    if (!saved) return;
    const state: GameWishesState = this.#states[game.id] ?? { records: [] };
    this.#importingGameIds.add(game.id);
    try {
      const newRecords = await game.wishHistory!.fetchNewWishes(saved.authkey, new Set(state.records.map(record => record.id)));
      const records = [...state.records, ...newRecords].sort((a, b) => a.id.length - b.id.length || a.id.localeCompare(b.id));
      this.#states[game.id] = { records, updatedAt: new Date().toISOString() };
      log('INFO', `${game.name}: ${newRecords.length} tiradas nuevas en el historial`);
    } catch (error) {
      this.#states[game.id] = { ...state, error: (error as Error).message, errorAt: new Date().toISOString() };
      // Enlace caducado o no válido: no se vuelve a probar cada hora
      if (Object.values(GACHA_LOG_RETCODE_MESSAGES).includes((error as Error).message)) this.#authkeys.delete(game.id);
      log('ERROR', `${game.name}: no se pudo leer el historial de tiradas (${(error as Error).message})`);
    } finally {
      this.#importingGameIds.delete(game.id);
    }
    writeDataFile(DATA_FILE_NAMES.wishes, this.#states);
  }

  /** Cada hora: trae las tiradas nuevas de los juegos cuyo enlace aún vale. */
  async importWithSavedLinks(): Promise<void> {
    for (const game of this.#games) {
      const saved = this.#authkeys.get(game.id);
      if (saved && Date.now() - saved.savedAt > GACHA_LOG_PACING.authkeyLifetimeMs) this.#authkeys.delete(game.id);
      else if (saved) await this.importWishes(game);
    }
  }

  getView(game: GameModule, version: GameVersion | null): GameDashboard['wishes'] {
    if (!game.wishHistory) return null;
    const { records = [], updatedAt, error } = this.#states[game.id] ?? {};
    return {
      isImporting: this.#importingGameIds.has(game.id),
      hasValidLink: this.#authkeys.has(game.id),
      error,
      summary: updatedAt ? { updatedAt, totalPulls: records.length, banners: summarizeWishBanners(records, game.wishHistory, version) } : undefined,
    };
  }
}

/** Saca la `authkey` del texto tal cual: `URLSearchParams` cambiaría sus `+` por espacios. */
function readAuthkey(link: string): string {
  const rawAuthkey = link.match(/[?&]authkey=([^&#\s]+)/)?.[1];
  if (!rawAuthkey) throw new Error('El enlace no trae authkey: cópialo entero con el script');
  try {
    return decodeURIComponent(rawAuthkey);
  } catch {
    return rawAuthkey;
  }
}

import { readDataFile, writeDataFile } from '../core/data-file-store.ts';
import { log } from '../core/log.ts';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';
import type { GameId } from '../models/game-id.type.ts';
import type { GameModule } from '../models/game-module.interface.ts';

/**
 * Iconos de los personajes que has tenido, para el historial de tiradas. Se van sumando (uno que sale de la lista
 * no se pierde) y se guardan en `data/character-icons.json`.
 */
export class CharacterIconService {
  #iconsByGame: Partial<Record<GameId, Record<string, string>>> = readDataFile(DATA_FILE_NAMES.characterIcons, {});
  #games: GameModule[];

  constructor(games: GameModule[]) {
    this.#games = games.filter(game => game.fetchCharacterIcons);
  }

  /** No lanza: si un juego falla se queda con los iconos que ya tenía. */
  async refresh(): Promise<void> {
    for (const game of this.#games) {
      try {
        this.#iconsByGame[game.id] = { ...this.#iconsByGame[game.id], ...await game.fetchCharacterIcons!() };
      } catch (error) {
        log('ERROR', `${game.name}: no se pudieron leer los iconos de los personajes (${(error as Error).message})`);
      }
    }
    writeDataFile(DATA_FILE_NAMES.characterIcons, this.#iconsByGame);
  }

  getIconUrl(gameId: GameId, name: string): string | null {
    return this.#iconsByGame[gameId]?.[name.toLowerCase()] ?? null;
  }
}

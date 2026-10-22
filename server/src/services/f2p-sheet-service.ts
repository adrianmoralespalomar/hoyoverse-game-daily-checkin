import { parseCsv } from '../core/csv.ts';
import { readDataFile, writeDataFile } from '../core/data-file-store.ts';
import { F2P_SHEET_PARSERS } from '../core/f2p-sheet-parsers.ts';
import { log } from '../core/log.ts';
import { waitRandomly } from '../core/pacing.ts';
import { buildVersionF2pTarget } from '../core/version-f2p-target.ts';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';
import type { GameF2pSheetState } from '../models/game-f2p-sheet-state.interface.ts';
import type { GameId } from '../models/game-id.type.ts';
import type { GameVersion } from '../models/game-version.interface.ts';
import type { HoyoverseGameConfig } from '../models/hoyoverse-game-config.interface.ts';
import type { IncomeExtras } from '../models/income-extras.interface.ts';
import { REQUEST_PACING } from '../models/request-pacing.const.ts';
import type { VersionF2pTarget } from '../models/version-f2p-target.interface.ts';

/**
 * Las hojas de la comunidad con las tiradas F2P de cada versión (una por juego, públicas). Se leen una vez al día
 * y se guardan en `data/f2p-sheets.json`: no necesitan ninguna cookie.
 */
export class F2pSheetService {
  #states: Partial<Record<GameId, GameF2pSheetState>> = readDataFile(DATA_FILE_NAMES.f2pSheets, {});
  #games: HoyoverseGameConfig[];

  constructor(games: HoyoverseGameConfig[]) {
    this.#games = games;
  }

  async refresh(): Promise<void> {
    for (const [index, game] of this.#games.entries()) {
      if (index > 0) await waitRandomly(REQUEST_PACING.betweenCheckInsMs);
      const state: GameF2pSheetState = this.#states[game.id] ?? { versions: {} };
      try {
        const response = await fetch(game.f2pSheetCsvUrl, { signal: AbortSignal.timeout(REQUEST_PACING.timeoutMs) });
        if (!response.ok) throw new Error(`La hoja respondió HTTP ${response.status}`);
        this.#states[game.id] = { versions: F2P_SHEET_PARSERS[game.id](parseCsv(await response.text())), fetchedAt: new Date().toISOString() };
      } catch (error) {
        this.#states[game.id] = { ...state, error: (error as Error).message, errorAt: new Date().toISOString() };
        log('ERROR', `${game.name}: no se pudo leer la hoja de tiradas F2P (${(error as Error).message})`);
      }
    }
    writeDataFile(DATA_FILE_NAMES.f2pSheets, this.#states);
  }

  buildTarget(gameId: GameId, version: GameVersion, manualPulls: number | null, extras: IncomeExtras): VersionF2pTarget {
    const { versions = {}, fetchedAt, error } = this.#states[gameId] ?? {};
    return buildVersionF2pTarget({ gameId, version, sheetVersions: versions, sheetFetchedAt: fetchedAt ?? null, sheetError: error ?? null, manualPulls, extras });
  }
}

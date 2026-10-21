import { readDataFile, writeDataFile } from '../core/data-file-store.ts';
import { serverMonthEndMs, serverMonthKeysBetween } from '../core/game-time.ts';
import { log } from '../core/log.ts';
import { waitRandomly } from '../core/pacing.ts';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';
import type { GameDashboard } from '../models/game-dashboard.interface.ts';
import { GAME_CALENDAR } from '../models/game-calendar.const.ts';
import type { GameId } from '../models/game-id.type.ts';
import type { GameIncomeState } from '../models/game-income-state.interface.ts';
import type { GameModule } from '../models/game-module.interface.ts';
import type { GameVersion } from '../models/game-version.interface.ts';
import { REQUEST_PACING } from '../models/request-pacing.const.ts';
import type { CookieStateStore } from './cookie-state-store.ts';

/**
 * Lo ganado en la versión actual según el diario (protogemas, jade estelar, películas). Guarda los meses en
 * `data/income.json`: un mes que ya acabó se lee una vez; el actual, en cada consulta.
 */
export class IncomeService {
  #states: Partial<Record<GameId, GameIncomeState>> = readDataFile(DATA_FILE_NAMES.income, {});
  #games: GameModule[];
  #cookies: CookieStateStore;

  constructor(games: GameModule[], cookies: CookieStateStore) {
    this.#games = games.filter(game => game.fetchIncomeMonth);
    this.#cookies = cookies;
  }

  /** `getVersion` da la versión de cada juego (sale del calendario: hay que leerlo antes). */
  async refresh(getVersion: (gameId: GameId) => GameVersion | null): Promise<void> {
    if (!this.#cookies.isUsable('checkIn') || !this.#cookies.isUsable('redeem')) return;
    for (const [index, game] of this.#games.entries()) {
      const version = getVersion(game.id);
      if (!version) continue;
      if (index > 0) await waitRandomly(REQUEST_PACING.betweenCheckInsMs);
      const state: GameIncomeState = this.#states[game.id] ?? { months: {} };
      const monthKeys = serverMonthKeysBetween(Date.parse(version.startsAt), Math.min(Date.now(), Date.parse(version.endsAt)));
      try {
        const months: GameIncomeState['months'] = {};
        for (const monthKey of monthKeys) {
          const cachedMonth = state.months[monthKey];
          months[monthKey] = cachedMonth && Date.parse(cachedMonth.fetchedAt) > serverMonthEndMs(monthKey)
            ? cachedMonth
            : { entries: await game.fetchIncomeMonth!(monthKey), fetchedAt: new Date().toISOString() };
        }
        this.#states[game.id] = { months };
      } catch (error) {
        this.#states[game.id] = { ...state, error: (error as Error).message, errorAt: new Date().toISOString() };
        log('ERROR', `${game.name}: no se pudo leer el diario (${(error as Error).message})`);
      }
    }
    writeDataFile(DATA_FILE_NAMES.income, this.#states);
  }

  getView(game: GameModule, version: GameVersion | null, f2pPulls: number | null): GameDashboard['income'] {
    if (!game.fetchIncomeMonth) return game.incomeDisabledReason ? { disabledReason: game.incomeDisabledReason } : null;
    const { months = {}, error } = this.#states[game.id] ?? {};
    if (!version || !Object.keys(months).length) return { error };
    const [startMs, endMs] = [Date.parse(version.startsAt), Date.parse(version.endsAt)];
    const entries = Object.values(months).flatMap(month => month.entries).filter(entry => Date.parse(entry.at) >= startMs && Date.parse(entry.at) < endMs);
    const amountsBySource = new Map<string, number>();
    entries.forEach(({ source, amount }) => amountsBySource.set(source, (amountsBySource.get(source) ?? 0) + amount));
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
    const fetchedDates = Object.values(months).map(month => month.fetchedAt).sort();
    return {
      error,
      income: {
        versionName: version.name,
        total,
        bySource: [...amountsBySource].map(([source, amount]) => ({ source, amount })).sort((a, b) => b.amount - a.amount),
        f2pPulls,
        pullsLeft: f2pPulls === null ? null : Math.max(0, Math.ceil(f2pPulls - total / GAME_CALENDAR.currencyPerPull)),
        fetchedAt: fetchedDates.at(-1) ?? null,
      },
    };
  }
}

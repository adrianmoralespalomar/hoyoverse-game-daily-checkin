import { readDataFile, writeDataFile } from '../core/data-file-store.ts';
import { log } from '../core/log.ts';
import { waitRandomly } from '../core/pacing.ts';
import { CODE_RETENTION_DAYS } from '../models/code-retention-days.const.ts';
import type { CodesStoreData } from '../models/codes-store-data.interface.ts';
import { COOKIE_ACCEPTED_REDEEM_STATUSES } from '../models/cookie-accepted-redeem-statuses.const.ts';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';
import type { GameCodesState } from '../models/game-codes-state.interface.ts';
import type { GameDashboard } from '../models/game-dashboard.interface.ts';
import type { GameModule } from '../models/game-module.interface.ts';
import { MS_PER_DAY } from '../models/ms-per-day.const.ts';
import { REQUEST_PACING } from '../models/request-pacing.const.ts';
import { RETRYABLE_CODE_STATUSES } from '../models/retryable-code-statuses.const.ts';
import type { CookieStateStore } from './cookie-state-store.ts';

/** Busca códigos nuevos y los canjea uno a uno. Lo que pasa queda en `data/codes.json`. */
export class CodeRedemptionService {
  #data: CodesStoreData = readDataFile<CodesStoreData>(DATA_FILE_NAMES.codes, { games: {} });
  #games: GameModule[];
  #cookies: CookieStateStore;

  constructor(games: GameModule[], cookies: CookieStateStore) {
    this.#games = games.filter(game => game.fetchAvailableCodes);
    this.#cookies = cookies;
  }

  async run(): Promise<void> {
    for (const game of this.#games) await this.#refreshCodes(game);
    this.#data.lastRunAt = new Date().toISOString();
    this.#save();
    if (!this.#cookies.isUsable('redeem')) return;

    let hasRedeemedBefore = false;
    for (const game of this.#games.filter(game => game.redeemCode)) {
      const state = this.#getState(game);
      const pendingCodes = state.activeCodes.filter(code => RETRYABLE_CODE_STATUSES.has(state.records[code].status));
      for (const code of pendingCodes) {
        if (hasRedeemedBefore) await waitRandomly(REQUEST_PACING.betweenRedeemsMs);
        hasRedeemedBefore = true;
        const shouldContinue = await this.#redeem(game, state, code);
        if (!shouldContinue) return;
      }
    }
  }

  async #refreshCodes(game: GameModule): Promise<void> {
    const state = this.#getState(game);
    try {
      const availableCodes = await game.fetchAvailableCodes!();
      const now = new Date().toISOString();
      for (const { code, rewards } of availableCodes) {
        state.records[code] ??= { code, rewards, firstSeenAt: now, status: 'pending', attempts: 0 };
        state.records[code].rewards = rewards || state.records[code].rewards;
      }
      state.activeCodes = availableCodes.map(({ code }) => code);
      state.lastFetchedAt = now;
      delete state.fetchError;
    } catch (error) {
      state.fetchError = (error as Error).message;
      log('ERROR', `${game.name}: no se pudieron consultar los códigos (${state.fetchError})`);
    }
    this.#forgetOldCodes(state);
  }

  #getState(game: GameModule): GameCodesState {
    return this.#data.games[game.id] ??= { records: {}, activeCodes: [] };
  }

  #forgetOldCodes(state: GameCodesState): void {
    const cutoff = Date.now() - CODE_RETENTION_DAYS * MS_PER_DAY;
    for (const record of Object.values(state.records)) {
      if (!state.activeCodes.includes(record.code) && Date.parse(record.firstSeenAt) < cutoff) delete state.records[record.code];
    }
  }

  #save(): void {
    writeDataFile(DATA_FILE_NAMES.codes, this.#data);
  }

  /** Devuelve si se puede seguir con el siguiente código. */
  async #redeem(game: GameModule, state: GameCodesState, code: string): Promise<boolean> {
    const result = await game.redeemCode!(code);
    const record = state.records[code];
    record.attempts++;
    record.attemptedAt = new Date().toISOString();
    record.message = result.message;
    record.status = result.status === 'retry' && record.attempts >= REQUEST_PACING.maxRedeemAttempts ? 'failed' : result.status;
    this.#save();
    log(record.status === 'redeemed' ? 'INFO' : 'ERROR', `${game.name} · ${code}: ${record.status} — ${result.message}`);

    if (COOKIE_ACCEPTED_REDEEM_STATUSES.has(result.status)) this.#cookies.report('redeem', 'ok');
    if (result.status === 'bad_cookie') {
      this.#cookies.report('redeem', 'expired');
      return false;
    }
    // Si HoYoverse pide verificación, se para la ronda para no insistir
    return result.status !== 'manual';
  }

  getView(game: GameModule): GameDashboard['codes'] {
    if (!game.fetchAvailableCodes) return null;
    const state = this.#data.games[game.id] ?? { records: {}, activeCodes: [] };
    const codes = Object.values(state.records)
      .map(record => ({ ...record, isActive: state.activeCodes.includes(record.code) }))
      .sort((first, second) => Number(second.isActive) - Number(first.isActive) || second.firstSeenAt.localeCompare(first.firstSeenAt));
    return {
      isRedeemEnabled: !!game.redeemCode,
      redeemDisabledReason: game.redeemDisabledReason,
      lastFetchedAt: state.lastFetchedAt,
      fetchError: state.fetchError,
      codes,
    };
  }
}

import { readDataFile, writeDataFile } from '../core/data-file-store.ts';
import { getHoyolabDayKey } from '../core/hoyolab-day.ts';
import { log } from '../core/log.ts';
import { waitRandomly } from '../core/pacing.ts';
import { CHECK_IN_STATUS_ICONS } from '../models/check-in-status-icons.const.ts';
import type { CheckInStoreData } from '../models/check-in-store-data.interface.ts';
import type { CheckInTrigger } from '../models/check-in-trigger.type.ts';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';
import { FINAL_CHECK_IN_STATUSES } from '../models/final-check-in-statuses.const.ts';
import type { GameDashboard } from '../models/game-dashboard.interface.ts';
import type { GameModule } from '../models/game-module.interface.ts';
import { REQUEST_PACING } from '../models/request-pacing.const.ts';
import { SCHEDULE } from '../models/schedule.const.ts';
import type { CookieStateStore } from './cookie-state-store.ts';

/** Check-in diario de cada juego. Lo que pasa queda en `data/check-in.json`. */
export class CheckInService {
  #data: CheckInStoreData = readDataFile<CheckInStoreData>(DATA_FILE_NAMES.checkIn, { attemptsInDay: 0, games: {} });
  #games: GameModule[];
  #cookies: CookieStateStore;
  #startJitterMs: number;

  constructor(games: GameModule[], cookies: CookieStateStore, startJitterMs: number) {
    this.#games = games.filter(game => game.checkIn);
    this.#cookies = cookies;
    this.#startJitterMs = startJitterMs;
  }

  /** Si hoy (día de HoYoLAB) aún falta y quedan intentos. Para ponerse al día al arrancar y reintentar cada hora. */
  needsCatchUp({ onlyIfAttemptedToday }: { onlyIfAttemptedToday: boolean }): boolean {
    const today = getHoyolabDayKey();
    if (!this.#games.length || this.#data.completedDayKey === today) return false;
    const isAttemptedToday = this.#data.attemptsDayKey === today;
    if (onlyIfAttemptedToday && !isAttemptedToday) return false;
    return !isAttemptedToday || this.#data.attemptsInDay < SCHEDULE.maxCheckInAttemptsPerDay;
  }

  async run(trigger: CheckInTrigger): Promise<void> {
    if (!this.#games.length) return log('ERROR', 'Check-in: falta HOYOLAB_COOKIE en el .env (o no es válida)');
    // Una cookie rechazada no se vuelve a probar sola: solo al cambiarla o desde el botón del panel
    if (trigger !== 'manual' && !this.#cookies.isUsable('checkIn')) return log('ERROR', 'Check-in: la cookie está caducada, cópiala de nuevo');
    if (trigger === 'scheduled' && this.#data.completedDayKey === getHoyolabDayKey()) return log('INFO', 'Check-in: hoy ya está hecho');
    if (trigger === 'scheduled' && this.#startJitterMs > 0) await waitRandomly({ min: 0, max: this.#startJitterMs });

    const today = getHoyolabDayKey();
    this.#data.attemptsInDay = this.#data.attemptsDayKey === today ? this.#data.attemptsInDay + 1 : 1;
    this.#data.attemptsDayKey = today;
    for (const [index, game] of this.#games.entries()) {
      if (index > 0) await waitRandomly(REQUEST_PACING.betweenCheckInsMs);
      const result = await game.checkIn!();
      this.#data.games[game.id] = { ...this.#data.games[game.id], lastResult: result, lastRunAt: new Date().toISOString(), lastRunDayKey: today };
      log(result.status === 'error' ? 'ERROR' : 'INFO', `${CHECK_IN_STATUS_ICONS[result.status]} ${game.name}: ${result.status} — ${result.message}`);
      if (['ok', 'already'].includes(result.status)) this.#cookies.report('checkIn', 'ok');
      // Si la cookie no vale para uno, no vale para ninguno: se para sin insistir
      if (result.status === 'bad_cookie') {
        this.#cookies.report('checkIn', 'expired');
        break;
      }
    }
    if (this.#isTodayFinished(today)) this.#data.completedDayKey = today;
    this.#save();
    await this.refreshSummaries();
  }

  #isTodayFinished(today: string): boolean {
    return this.#games.every(game => {
      const state = this.#data.games[game.id];
      return state?.lastRunDayKey === today && !!state.lastResult && FINAL_CHECK_IN_STATUSES.has(state.lastResult.status);
    }) || this.#cookies.get('checkIn').health === 'expired';
  }

  #save(): void {
    writeDataFile(DATA_FILE_NAMES.checkIn, this.#data);
  }

  /** Calendario del mes de cada juego. Si falla, se queda el último que se consiguió. */
  async refreshSummaries(): Promise<void> {
    if (!this.#cookies.isUsable('checkIn')) return;
    for (const game of this.#games) {
      try {
        const summary = await game.fetchCheckInSummary!();
        this.#data.games[game.id] = { ...this.#data.games[game.id], summary, summaryUpdatedAt: new Date().toISOString() };
      } catch (error) {
        log('ERROR', `${game.name}: no se pudo leer el calendario de check-in (${(error as Error).message})`);
      }
    }
    this.#save();
  }

  getView(game: GameModule): GameDashboard['checkIn'] {
    if (!game.checkIn) return null;
    const state = this.#data.games[game.id];
    const isDoneToday = state?.lastRunDayKey === getHoyolabDayKey() && ['ok', 'already'].includes(state.lastResult?.status ?? '');
    return { isDoneToday, lastResult: state?.lastResult, lastRunAt: state?.lastRunAt, summary: state?.summary };
  }
}

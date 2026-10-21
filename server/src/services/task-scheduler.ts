import cron, { type ScheduledTask } from 'node-cron';
import type { ExclusiveRunner } from '../core/exclusive-runner.ts';
import { log } from '../core/log.ts';
import { CHECK_IN_TIME_PATTERN } from '../models/check-in-time-pattern.const.ts';
import { SCHEDULE } from '../models/schedule.const.ts';
import type { CheckInService } from './check-in-service.ts';
import type { CodeRedemptionService } from './code-redemption-service.ts';
import type { IncomeService } from './income-service.ts';
import type { NotesService } from './notes-service.ts';
import type { ProgressService } from './progress-service.ts';
import type { WishHistoryService } from './wish-history-service.ts';

/**
 * Sustituye al cron del sistema y al Programador de tareas:
 * - A la hora elegida en el panel: check-in del día.
 * - Cada hora: reintenta el check-in si falló por la red, busca (y canjea) códigos nuevos y trae las tiradas
 *   nuevas si el enlace del historial aún vale.
 * - Cada 20 minutos: resina y energía.
 * - Cada 2 horas: calendario, contenido final y diario de ingresos.
 * - Al arrancar: si hoy aún no se ha hecho el check-in (el NAS estaba apagado), lo hace, y busca códigos.
 */
export class TaskScheduler {
  #runner: ExclusiveRunner;
  #checkIn: CheckInService;
  #codes: CodeRedemptionService;
  #notes: NotesService;
  #progress: ProgressService;
  #income: IncomeService;
  #wishes: WishHistoryService;
  #checkInTask?: ScheduledTask;
  /** La lectura del calendario y el diario en curso: si se pide otra mientras tanto, se espera a esta. */
  #progressRefresh?: Promise<void>;

  constructor(runner: ExclusiveRunner, checkIn: CheckInService, codes: CodeRedemptionService, notes: NotesService, progress: ProgressService, income: IncomeService, wishes: WishHistoryService) {
    this.#runner = runner;
    this.#checkIn = checkIn;
    this.#codes = codes;
    this.#notes = notes;
    this.#progress = progress;
    this.#income = income;
    this.#wishes = wishes;
  }

  start(checkInTime: string): void {
    this.setCheckInTime(checkInTime);
    cron.schedule(SCHEDULE.hourlyCron, () => this.#runHourlyTasks());
    // Las notas, el calendario y el diario solo leen: no hace falta esperar a que acaben el check-in o los canjes
    cron.schedule(SCHEDULE.notesCron, () => this.#refreshNotes());
    cron.schedule(SCHEDULE.progressCron, () => this.#refreshProgress());
    setTimeout(() => this.#runStartupTasks(), SCHEDULE.startupDelayMs);
  }

  #refreshNotes(): void {
    this.#notes.refresh().catch((error: Error) => log('ERROR', `Notas fallidas: ${error.message}`));
  }

  #refreshProgress(): void {
    this.refreshProgressAndIncome().catch((error: Error) => log('ERROR', `Calendario o diario fallidos: ${error.message}`));
  }

  /**
   * El diario necesita la versión, que sale del calendario: van en este orden. Son unas 20 consultas, así que
   * nunca se lanzan dos a la vez (botón de cada juego y la ronda de cada 2 horas).
   */
  refreshProgressAndIncome(): Promise<void> {
    this.#progressRefresh ??= this.#progress.refresh()
      .then(() => this.#income.refresh(gameId => this.#progress.getVersion(gameId)))
      .finally(() => this.#progressRefresh = undefined);
    return this.#progressRefresh;
  }

  /** Cambia la hora del check-in diario sin reiniciar el daemon. */
  setCheckInTime(checkInTime: string): void {
    const [, hours, minutes] = checkInTime.match(CHECK_IN_TIME_PATTERN)!;
    this.#checkInTask?.destroy();
    this.#checkInTask = cron.schedule(`${Number(minutes)} ${Number(hours)} * * *`, () => this.#runSafely(() => this.#checkIn.run('scheduled')));
    log('INFO', `Check-in diario a las ${checkInTime}`);
  }

  #runSafely(task: () => Promise<void>): void {
    this.#runner.run(task).catch((error: Error) => log('ERROR', `Tarea fallida: ${error.message}`));
  }

  #runHourlyTasks(): void {
    if (this.#checkIn.needsCatchUp({ onlyIfAttemptedToday: true })) this.#runSafely(() => this.#checkIn.run('catch_up'));
    this.#runSafely(() => this.#codes.run());
    this.#runSafely(() => this.#wishes.importWithSavedLinks());
  }

  #runStartupTasks(): void {
    if (this.#checkIn.needsCatchUp({ onlyIfAttemptedToday: false })) this.#runSafely(() => this.#checkIn.run('catch_up'));
    else this.#runSafely(() => this.#checkIn.refreshSummaries());
    this.#runSafely(() => this.#codes.run());
    this.#refreshNotes();
    this.#refreshProgress();
  }
}

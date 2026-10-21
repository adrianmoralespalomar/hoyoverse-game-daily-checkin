import cron, { type ScheduledTask } from 'node-cron';
import type { ExclusiveRunner } from '../core/exclusive-runner.ts';
import { log } from '../core/log.ts';
import { CHECK_IN_TIME_PATTERN } from '../models/check-in-time-pattern.const.ts';
import { SCHEDULE } from '../models/schedule.const.ts';
import type { CheckInService } from './check-in-service.ts';
import type { CodeRedemptionService } from './code-redemption-service.ts';
import type { NotesService } from './notes-service.ts';

/**
 * Sustituye al cron del sistema y al Programador de tareas:
 * - A la hora elegida en el panel: check-in del día.
 * - Cada hora: reintenta el check-in si falló por la red y busca (y canjea) códigos nuevos.
 * - Cada 20 minutos: resina y energía.
 * - Al arrancar: si hoy aún no se ha hecho el check-in (el NAS estaba apagado), lo hace, y busca códigos.
 */
export class TaskScheduler {
  #runner: ExclusiveRunner;
  #checkIn: CheckInService;
  #codes: CodeRedemptionService;
  #notes: NotesService;
  #checkInTask?: ScheduledTask;

  constructor(runner: ExclusiveRunner, checkIn: CheckInService, codes: CodeRedemptionService, notes: NotesService) {
    this.#runner = runner;
    this.#checkIn = checkIn;
    this.#codes = codes;
    this.#notes = notes;
  }

  start(checkInTime: string): void {
    this.setCheckInTime(checkInTime);
    cron.schedule(SCHEDULE.hourlyCron, () => this.#runHourlyTasks());
    // Las notas solo leen: no hace falta esperar a que acaben el check-in o los canjes
    cron.schedule(SCHEDULE.notesCron, () => this.#refreshNotes());
    setTimeout(() => this.#runStartupTasks(), SCHEDULE.startupDelayMs);
  }

  #refreshNotes(): void {
    this.#notes.refresh().catch((error: Error) => log('ERROR', `Notas fallidas: ${error.message}`));
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
  }

  #runStartupTasks(): void {
    if (this.#checkIn.needsCatchUp({ onlyIfAttemptedToday: false })) this.#runSafely(() => this.#checkIn.run('catch_up'));
    else this.#runSafely(() => this.#checkIn.refreshSummaries());
    this.#runSafely(() => this.#codes.run());
    this.#refreshNotes();
  }
}

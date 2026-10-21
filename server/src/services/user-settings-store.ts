import { readDataFile, writeDataFile } from '../core/data-file-store.ts';
import { CHECK_IN_TIME_PATTERN } from '../models/check-in-time-pattern.const.ts';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';
import type { GameId } from '../models/game-id.type.ts';
import { SCHEDULE } from '../models/schedule.const.ts';
import type { UserSettings } from '../models/user-settings.interface.ts';

export class UserSettingsStore {
  #settings: UserSettings = {
    checkInTime: SCHEDULE.defaultCheckInTime,
    f2pPullsByVersion: {},
    ...readDataFile<Partial<UserSettings>>(DATA_FILE_NAMES.settings, {}),
  };

  get(): UserSettings {
    return { ...this.#settings };
  }

  /** Lanza si la hora no es `HH:mm` (el panel enseña el mensaje). */
  saveCheckInTime(checkInTime: unknown): UserSettings {
    if (typeof checkInTime !== 'string' || !CHECK_IN_TIME_PATTERN.test(checkInTime)) throw new Error('La hora tiene que ser HH:mm, por ejemplo 19:00');
    this.#settings.checkInTime = checkInTime;
    writeDataFile(DATA_FILE_NAMES.settings, this.#settings);
    return this.get();
  }

  getF2pPulls(gameId: GameId, version: string | undefined): number | null {
    return version ? this.#settings.f2pPullsByVersion[gameId]?.[version] ?? null : null;
  }

  /** `pulls` vacío o `null` borra la estimación. Lanza si no es un número razonable. */
  saveF2pPulls(gameId: GameId, version: unknown, pulls: unknown): void {
    if (typeof version !== 'string' || !version.trim()) throw new Error('Falta la versión');
    const byVersion = this.#settings.f2pPullsByVersion[gameId] ??= {};
    if (pulls === null || pulls === '') delete byVersion[version];
    else if (typeof pulls === 'number' && Number.isFinite(pulls) && pulls >= 0 && pulls <= 1000) byVersion[version] = pulls;
    else throw new Error('Las tiradas tienen que ser un número entre 0 y 1000');
    writeDataFile(DATA_FILE_NAMES.settings, this.#settings);
  }
}

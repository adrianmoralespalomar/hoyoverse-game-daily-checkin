import { readDataFile, writeDataFile } from '../core/data-file-store.ts';
import { CHECK_IN_TIME_PATTERN } from '../models/check-in-time-pattern.const.ts';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';
import { SCHEDULE } from '../models/schedule.const.ts';
import type { UserSettings } from '../models/user-settings.interface.ts';

export class UserSettingsStore {
  #settings: UserSettings = { checkInTime: SCHEDULE.defaultCheckInTime, ...readDataFile<Partial<UserSettings>>(DATA_FILE_NAMES.settings, {}) };

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
}

import { randomUUID } from 'node:crypto';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';
import { readDataFile, writeDataFile } from './data-file-store.ts';

/** El navegador manda siempre el mismo identificador: aquí se genera una vez y se reutiliza. */
export function readOrCreateDeviceUuid(): string {
  const { deviceUuid } = readDataFile<{ deviceUuid?: string }>(DATA_FILE_NAMES.device, {});
  if (deviceUuid) return deviceUuid;
  const newDeviceUuid = randomUUID();
  writeDataFile(DATA_FILE_NAMES.device, { deviceUuid: newDeviceUuid });
  return newDeviceUuid;
}

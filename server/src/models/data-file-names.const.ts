/** Ficheros de `data/`. Solo existen en el NAS. */
export const DATA_FILE_NAMES = {
  checkIn: 'check-in.json',
  codes: 'codes.json',
  cookies: 'cookies.json',
  notes: 'notes.json',
  progress: 'progress.json',
  income: 'income.json',
  f2pSheets: 'f2p-sheets.json',
  wishes: 'wishes.json',
  settings: 'settings.json',
  /** Identificador de dispositivo que se manda al canjear, como hace el navegador. Se genera una vez. */
  device: 'device.json',
} as const;

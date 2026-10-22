import type { F2pSheetVersion } from '../models/f2p-sheet-version.interface.ts';
import type { GameId } from '../models/game-id.type.ts';

const VERSION_PATTERN = /^(\d+\.\d+)/;
const FORMAT_CHANGED_MESSAGE = 'La hoja ha cambiado de formato: no encuentro las filas que se esperaban';

/** Traduce el CSV de la hoja de la comunidad de cada juego a las tiradas por versión. Lanza si cambia de formato. */
export const F2P_SHEET_PARSERS: Record<GameId, (rows: string[][]) => Record<string, F2pSheetVersion>> = {
  gi: parseGenshinSheet,
  hsr: rows => parseVersionsAcrossSheet(rows, 'F2P Limited Total'),
  zzz: rows => parseVersionsAcrossSheet(rows, 'F2P Exclusive Total'),
};

function toNumber(cell: string | undefined): number {
  return Number((cell ?? '').replace(/,/g, ''));
}

/** Genshin: una fila por versión (`7.1 est.`), con el total de tiradas F2P en la octava columna. */
function parseGenshinSheet(rows: string[][]): Record<string, F2pSheetVersion> {
  const versions: Record<string, F2pSheetVersion> = {};
  for (const [label = '', ...columns] of rows) {
    const version = label.trim().match(VERSION_PATTERN)?.[1];
    const f2pPulls = toNumber(columns[6]);
    if (version && f2pPulls > 0) versions[version] = { f2pPulls, battlePassPulls: null, isEstimate: /est/i.test(label) };
  }
  if (!Object.keys(versions).length) throw new Error(FORMAT_CHANGED_MESSAGE);
  return versions;
}

/** Star Rail y Zenless: una columna por versión, con una fila de totales F2P y otra del pase de batalla de pago. */
function parseVersionsAcrossSheet(rows: string[][], f2pRowLabel: string): Record<string, F2pSheetVersion> {
  const header = rows.find(([label]) => label === 'Version');
  const f2pRow = rows.find(([label]) => label === f2pRowLabel);
  const battlePassRow = rows.find(([label]) => label === 'Paid Battle Pass');
  if (!header || !f2pRow) throw new Error(FORMAT_CHANGED_MESSAGE);
  const versions: Record<string, F2pSheetVersion> = {};
  header.forEach((cell, column) => {
    const version = cell.trim().match(VERSION_PATTERN)?.[1];
    const f2pPulls = toNumber(f2pRow[column]);
    if (version && f2pPulls > 0) versions[version] = { f2pPulls, battlePassPulls: toNumber(battlePassRow?.[column]) || null, isEstimate: false };
  });
  if (!Object.keys(versions).length) throw new Error(FORMAT_CHANGED_MESSAGE);
  return versions;
}

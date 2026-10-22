import type { F2pSheetVersion } from './f2p-sheet-version.interface.ts';

/** Lo que se guarda en `data/f2p-sheets.json` por juego: la última lectura buena y el último error. */
export interface GameF2pSheetState {
  /** Por versión (`7.1`). */
  versions: Record<string, F2pSheetVersion>;
  fetchedAt?: string;
  error?: string;
  errorAt?: string;
}

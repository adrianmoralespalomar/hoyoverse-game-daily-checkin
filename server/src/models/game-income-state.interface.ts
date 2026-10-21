import type { IncomeEntry } from './income-entry.interface.ts';

/** Lo que se guarda en `data/income.json` por juego. */
export interface GameIncomeState {
  /** Por mes (`YYYYMM`). Un mes leído después de acabar ya no se vuelve a pedir. */
  months: Record<string, { entries: IncomeEntry[]; fetchedAt: string }>;
  error?: string;
  errorAt?: string;
}

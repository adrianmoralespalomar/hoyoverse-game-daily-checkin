import type { VersionF2pTarget } from './version-f2p-target.interface.ts';

/** Lo que llevas ganado de moneda de tiradas en la versión actual, comparado con lo que se espera. */
export interface VersionIncome {
  versionName: string;
  total: number;
  /** De más a menos. */
  bySource: { source: string; amount: number }[];
  target: VersionF2pTarget | null;
  /** Tiradas que te faltan por ganar respecto a `target.totalPulls`. */
  pullsLeft: number | null;
  /** Fecha del último mes leído del diario. */
  fetchedAt: string | null;
}

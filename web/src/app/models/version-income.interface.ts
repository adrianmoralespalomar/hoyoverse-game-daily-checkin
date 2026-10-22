import type { VersionF2pTarget } from './version-f2p-target.interface';

/** Espejo de `server/src/models/version-income.interface.ts`. */
export interface VersionIncome {
  versionName: string;
  total: number;
  bySource: { source: string; amount: number }[];
  target: VersionF2pTarget | null;
  pullsLeft: number | null;
  fetchedAt: string | null;
}

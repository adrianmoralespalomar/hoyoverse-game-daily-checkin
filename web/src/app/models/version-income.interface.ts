/** Espejo de `server/src/models/version-income.interface.ts`. */
export interface VersionIncome {
  versionName: string;
  total: number;
  bySource: { source: string; amount: number }[];
  f2pPulls: number | null;
  pullsLeft: number | null;
  fetchedAt: string | null;
}

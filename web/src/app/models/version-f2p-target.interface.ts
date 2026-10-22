/** Espejo de `server/src/models/version-f2p-target.interface.ts`. */
export interface VersionF2pTarget {
  sheetPulls: number | null;
  sheetKind: 'exact' | 'sheet-estimate' | 'average' | null;
  manualPulls: number | null;
  monthlyCard: { isEnabled: boolean; pulls: number };
  battlePass: { isEnabled: boolean; pulls: number };
  totalPulls: number | null;
  sheetFetchedAt: string | null;
  sheetError: string | null;
}

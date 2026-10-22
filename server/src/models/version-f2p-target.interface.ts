/** Cuántas tiradas se espera ganar en la versión, de la hoja de la comunidad y de lo de pago que marques. */
export interface VersionF2pTarget {
  /** Tiradas F2P de la hoja. `null` si no hay hoja leída. */
  sheetPulls: number | null;
  /** `exact`: la hoja tiene la versión; `sheet-estimate`: la hoja la marca como estimada; `average`: no está y es la media. */
  sheetKind: 'exact' | 'sheet-estimate' | 'average' | null;
  /** Cifra que has apuntado tú: sustituye a la de la hoja. */
  manualPulls: number | null;
  monthlyCard: { isEnabled: boolean; pulls: number };
  battlePass: { isEnabled: boolean; pulls: number };
  /** Lo que se espera en total. `null` si no hay ninguna cifra base. */
  totalPulls: number | null;
  sheetFetchedAt: string | null;
  sheetError: string | null;
}

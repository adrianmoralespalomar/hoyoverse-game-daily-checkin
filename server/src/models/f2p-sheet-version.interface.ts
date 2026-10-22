/** Lo que dice la hoja de la comunidad de una versión (tiradas, no moneda). */
export interface F2pSheetVersion {
  f2pPulls: number;
  /** Tiradas extra del pase de batalla de pago. `null` si la hoja no lo separa (Genshin). */
  battlePassPulls: number | null;
  /** La hoja marca la versión como estimación (aún no ha acabado). */
  isEstimate: boolean;
}

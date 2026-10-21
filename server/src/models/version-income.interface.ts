/** Lo que llevas ganado de moneda de tiradas en la versión actual, comparado con tu estimación F2P. */
export interface VersionIncome {
  versionName: string;
  total: number;
  /** De más a menos. */
  bySource: { source: string; amount: number }[];
  /** Tiradas que da la versión a un F2P, según lo que hayas apuntado en el panel. */
  f2pPulls: number | null;
  /** Tiradas que te faltan por ganar respecto a `f2pPulls`. */
  pullsLeft: number | null;
  /** Fecha del último mes leído del diario. */
  fetchedAt: string | null;
}

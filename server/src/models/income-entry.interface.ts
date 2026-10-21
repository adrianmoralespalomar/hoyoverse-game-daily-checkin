/** Un ingreso de moneda de tiradas del diario. */
export interface IncomeEntry {
  at: string;
  /** De dónde viene, en texto para enseñar ("Eventos", "Correo"...). */
  source: string;
  amount: number;
}

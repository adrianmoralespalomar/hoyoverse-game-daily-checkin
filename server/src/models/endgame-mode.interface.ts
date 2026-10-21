/** Un modo de contenido final (Abismo, Salón del Olvido, Defensa de Shiyu...) en el periodo actual. */
export interface EndgameMode {
  name: string;
  /** Nombre del periodo o de la temporada, si lo tiene. */
  subtitle?: string;
  /** Texto del progreso tal cual se enseña: "18/36 ★", "Acto 8", "96.520 / 150.000 (S)". */
  progressLabel: string;
  /** 0 a 1, para la barra. `null` si el modo no tiene un máximo claro. */
  progress: number | null;
  isComplete: boolean;
  endsAt: string | null;
  /** Moneda de tiradas que da el modo completo, según el calendario. `null` si el juego no lo dice. */
  currencyTotal: number | null;
  /** Aproximado: las recompensas no van exactamente en proporción a las estrellas. */
  currencyLeft: number | null;
}

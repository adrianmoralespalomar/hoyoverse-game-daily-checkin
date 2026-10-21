/** Espejo de `server/src/models/endgame-mode.interface.ts`. */
export interface EndgameMode {
  name: string;
  subtitle?: string;
  progressLabel: string;
  progress: number | null;
  isComplete: boolean;
  endsAt: string | null;
  currencyTotal: number | null;
  /** Aproximado. */
  currencyLeft: number | null;
}

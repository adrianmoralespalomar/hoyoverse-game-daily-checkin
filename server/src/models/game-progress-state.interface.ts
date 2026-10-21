import type { GameProgress } from './game-progress.interface.ts';

/** Lo que se guarda en `data/progress.json` por juego: lo último que se leyó bien y el último error. */
export interface GameProgressState {
  progress?: GameProgress;
  error?: string;
  errorAt?: string;
}

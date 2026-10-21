import type { EndgameMode } from './endgame-mode.interface';

/** Un modo de contenido final listo para pintar. */
export interface EndgameModeView extends EndgameMode {
  /** "Te quedan ~400 protogemas · quedan 25 días" o "Completado · se renueva en 12 días". */
  detailText: string;
}

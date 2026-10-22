import type { GameDashboard } from './game-dashboard.interface.ts';
import type { GameId } from './game-id.type.ts';
import type { Livestream } from './livestream.interface.ts';

/** Lo que ven las reglas de avisos para decidir. Para una regla nueva basta leer de aquí. */
export interface AlertContext {
  now: number;
  /** Hora de Madrid a la que te despiertas, `HH:mm`. */
  wakeUpTime: string;
  games: GameDashboard[];
  /** Directo de la próxima versión de cada juego, si ya se ha anunciado. */
  livestreams: Partial<Record<GameId, Livestream>>;
}

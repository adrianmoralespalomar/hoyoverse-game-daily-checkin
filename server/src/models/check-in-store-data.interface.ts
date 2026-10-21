import type { GameCheckInState } from './game-check-in-state.interface.ts';
import type { GameId } from './game-id.type.ts';

/** Contenido de `data/check-in.json`. */
export interface CheckInStoreData {
  /** Día de HoYoLAB en el que todos los juegos quedaron hechos (o sin necesidad de reintento). */
  completedDayKey?: string;
  attemptsDayKey?: string;
  attemptsInDay: number;
  games: Partial<Record<GameId, GameCheckInState>>;
}

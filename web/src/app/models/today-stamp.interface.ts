import type { CheckInReward } from './check-in-reward.interface';
import type { GameId } from './game-id.type';

/** Un sello del hero: el check-in de hoy de un juego. */
export interface TodayStamp {
  gameId: GameId;
  shortName: string;
  accent: string;
  reward: CheckInReward | null;
  isDone: boolean;
  /** Algo que solo puedes arreglar tú (captcha, cookie caducada). */
  needsYou: boolean;
  /** Error de red o similar: se reintenta solo. */
  hasFailed: boolean;
  statusText: string;
  /** "Resina original 96/200", si ya se ha leído. */
  energyText: string | null;
  /** "Versión 7.1: quedan 13 días" y "Skirk y Escoffier: quedan 13 días", si ya se ha leído el calendario. */
  calendarLines: string[];
}

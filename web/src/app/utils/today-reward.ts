import type { CheckInReward } from '../models/check-in-reward.interface';
import type { GameDashboard } from '../models/game-dashboard.interface';

/** Posición de hoy en el calendario: la última sellada si ya está hecho, o la siguiente si falta. */
export function getTodayRewardIndex(game: GameDashboard): number | null {
  const summary = game.checkIn?.summary;
  if (!summary) return null;
  return game.checkIn!.isDoneToday || summary.isSignedToday ? summary.totalSignDays - 1 : summary.totalSignDays;
}

export function getTodayReward(game: GameDashboard): CheckInReward | null {
  const index = getTodayRewardIndex(game);
  return index === null ? null : game.checkIn?.summary?.monthRewards[index] ?? null;
}

import type { CheckInReward } from './check-in-reward.interface.ts';

/** Calendario del mes de HoYoLAB: cuántos días llevas y qué da cada día. */
export interface CheckInSummary {
  totalSignDays: number;
  isSignedToday: boolean;
  monthRewards: CheckInReward[];
}

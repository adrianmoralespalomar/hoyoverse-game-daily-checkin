import type { CheckInReward } from './check-in-reward.interface';

export interface CalendarDay {
  reward: CheckInReward;
  isClaimed: boolean;
  isToday: boolean;
}

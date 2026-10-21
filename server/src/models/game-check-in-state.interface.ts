import type { CheckInResult } from './check-in-result.interface.ts';
import type { CheckInSummary } from './check-in-summary.interface.ts';

export interface GameCheckInState {
  lastResult?: CheckInResult;
  lastRunAt?: string;
  /** Día de HoYoLAB (UTC+8) del último intento. */
  lastRunDayKey?: string;
  summary?: CheckInSummary;
  summaryUpdatedAt?: string;
}

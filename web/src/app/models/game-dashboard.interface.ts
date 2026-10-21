import type { CheckInReward } from './check-in-reward.interface';
import type { CheckInStatus } from './check-in-status.type';
import type { CodeView } from './code-view.interface';
import type { GameId } from './game-id.type';
import type { GameNotes } from './game-notes.interface';
import type { GameProgress } from './game-progress.interface';
import type { VersionIncome } from './version-income.interface';
import type { WishSummary } from './wish-summary.interface';

/** Espejo de `server/src/models/game-dashboard.interface.ts`. */
export interface GameDashboard {
  id: GameId;
  name: string;
  checkIn: {
    isDoneToday: boolean;
    lastResult?: { status: CheckInStatus; message: string; retcode?: number };
    lastRunAt?: string;
    summary?: { totalSignDays: number; isSignedToday: boolean; monthRewards: CheckInReward[] };
  } | null;
  codes: {
    isRedeemEnabled: boolean;
    redeemDisabledReason?: string;
    lastFetchedAt?: string;
    fetchError?: string;
    codes: CodeView[];
  } | null;
  notes: {
    notes?: GameNotes;
    error?: string;
    disabledReason?: string;
  } | null;
  progress: {
    progress?: GameProgress;
    error?: string;
    disabledReason?: string;
  } | null;
  income: {
    income?: VersionIncome;
    error?: string;
    disabledReason?: string;
  } | null;
  wishes: {
    summary?: WishSummary;
    isImporting: boolean;
    hasValidLink: boolean;
    error?: string;
  } | null;
}

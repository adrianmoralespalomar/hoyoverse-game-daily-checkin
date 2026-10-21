import type { CheckInResult } from './check-in-result.interface.ts';
import type { CheckInSummary } from './check-in-summary.interface.ts';
import type { CodeRecord } from './code-record.interface.ts';
import type { GameId } from './game-id.type.ts';
import type { GameNotes } from './game-notes.interface.ts';
import type { GameProgress } from './game-progress.interface.ts';
import type { VersionIncome } from './version-income.interface.ts';
import type { WishSummary } from './wish-summary.interface.ts';

export interface GameDashboard {
  id: GameId;
  name: string;
  checkIn: {
    isDoneToday: boolean;
    lastResult?: CheckInResult;
    lastRunAt?: string;
    summary?: CheckInSummary;
  } | null;
  codes: {
    isRedeemEnabled: boolean;
    redeemDisabledReason?: string;
    lastFetchedAt?: string;
    fetchError?: string;
    /** Más recientes primero. */
    codes: (CodeRecord & { isActive: boolean })[];
  } | null;
  /** Resina, energía y diarias. `error` puede venir junto a las últimas notas que sí se leyeron. */
  notes: {
    notes?: GameNotes;
    error?: string;
    disabledReason?: string;
  } | null;
  /** Versión, banners, contenido final y eventos. Igual que `notes`, `error` puede venir con lo último leído. */
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
    /** Hay un enlace de menos de 24 horas: las tiradas nuevas llegan solas cada hora. */
    hasValidLink: boolean;
    error?: string;
  } | null;
}

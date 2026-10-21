import type { AvailableCode } from './available-code.interface.ts';
import type { CheckInResult } from './check-in-result.interface.ts';
import type { CheckInSummary } from './check-in-summary.interface.ts';
import type { GameId } from './game-id.type.ts';
import type { GameNotes } from './game-notes.interface.ts';
import type { GameProgress } from './game-progress.interface.ts';
import type { IncomeEntry } from './income-entry.interface.ts';
import type { RedeemResult } from './redeem-result.interface.ts';
import type { WishHistoryCapability } from './wish-history-capability.interface.ts';

/**
 * Un juego y lo que se puede hacer con él. Cada capacidad es opcional: un juego que no sea de HoYoverse
 * puede tener solo algunas. Ninguna lanza excepciones salvo `fetchCheckInSummary` y `fetchAvailableCodes`.
 */
export interface GameModule {
  id: GameId;
  name: string;
  checkIn?: () => Promise<CheckInResult>;
  fetchCheckInSummary?: () => Promise<CheckInSummary>;
  fetchAvailableCodes?: () => Promise<AvailableCode[]>;
  /** Sin él, el juego no canjea códigos (falta la cookie de canje o el UID). */
  redeemCode?: (code: string) => Promise<RedeemResult>;
  /** Por qué no canjea, si `redeemCode` no está. */
  redeemDisabledReason?: string;
  /** Resina, energía, diarias... Lanza si HoYoLAB no las da. */
  fetchNotes?: () => Promise<GameNotes>;
  /** Por qué no hay notas, si `fetchNotes` no está. */
  notesDisabledReason?: string;
  /** Versión, banners, contenido final y eventos. Mismos requisitos que las notas. Lanza si HoYoLAB no los da. */
  fetchProgress?: () => Promise<GameProgress>;
  /** Ingresos de moneda de tiradas de un mes (`YYYYMM`) del diario. Lanza si HoYoLAB no los da. */
  fetchIncomeMonth?: (month: string) => Promise<IncomeEntry[]>;
  /** Por qué no hay diario, si `fetchIncomeMonth` no está. */
  incomeDisabledReason?: string;
  /** Historial de tiradas con el enlace del juego (no usa cookies). */
  wishHistory?: WishHistoryCapability;
}

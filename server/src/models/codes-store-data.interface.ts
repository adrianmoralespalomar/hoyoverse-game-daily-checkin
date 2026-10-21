import type { GameCodesState } from './game-codes-state.interface.ts';
import type { GameId } from './game-id.type.ts';

/** Contenido de `data/codes.json`. */
export interface CodesStoreData {
  lastRunAt?: string;
  games: Partial<Record<GameId, GameCodesState>>;
}

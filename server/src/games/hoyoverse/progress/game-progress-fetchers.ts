import type { GameId } from '../../../models/game-id.type.ts';
import type { GameProgress } from '../../../models/game-progress.interface.ts';
import type { GameRecordClient } from '../../../models/game-record-client.interface.ts';
import { fetchGenshinProgress } from './genshin-progress.ts';
import { fetchStarRailProgress } from './star-rail-progress.ts';
import { fetchZenlessProgress } from './zenless-progress.ts';

/** Cada juego reparte su calendario y su contenido final en endpoints distintos. */
export const GAME_PROGRESS_FETCHERS: Record<GameId, (client: GameRecordClient, currencyItemId: number, now: number) => Promise<GameProgress>> = {
  gi: fetchGenshinProgress,
  hsr: fetchStarRailProgress,
  zzz: (client, _currencyItemId, now) => fetchZenlessProgress(client, now),
};

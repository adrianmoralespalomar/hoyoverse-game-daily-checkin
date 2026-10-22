import { CHARACTER_ICON_SOURCES } from '../../models/character-icon-sources.const.ts';
import type { GameId } from '../../models/game-id.type.ts';
import type { GameRecordClient } from '../../models/game-record-client.interface.ts';

/** Nombre del personaje en minúsculas → URL de su icono. Lanza si HoYoLAB no da la lista. */
export async function fetchCharacterIcons(gameId: GameId, client: GameRecordClient): Promise<Record<string, string>> {
  const { method, endpoint, listKey, nameKey, iconKey } = CHARACTER_ICON_SOURCES[gameId];
  const data = method === 'post' ? await client.post<Record<string, unknown>>(endpoint) : await client.get<Record<string, unknown>>(endpoint);
  const characters = (data[listKey] ?? []) as Record<string, unknown>[];
  const entries = characters.filter(character => typeof character[nameKey] === 'string' && typeof character[iconKey] === 'string')
    .map(character => [(character[nameKey] as string).toLowerCase(), character[iconKey] as string] as const);
  return Object.fromEntries(entries);
}

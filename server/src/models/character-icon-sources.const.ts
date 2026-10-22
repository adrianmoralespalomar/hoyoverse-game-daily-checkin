import type { CharacterIconSource } from './character-icon-source.interface.ts';
import type { GameId } from './game-id.type.ts';

/** Solo salen los personajes que tienes: los que has perdido en un 50/50 se quedan con las iniciales. */
export const CHARACTER_ICON_SOURCES: Record<GameId, CharacterIconSource> = {
  gi: { method: 'post', endpoint: 'character/list', listKey: 'list', nameKey: 'name', iconKey: 'icon' },
  hsr: { method: 'get', endpoint: 'avatar/info', listKey: 'avatar_list', nameKey: 'name', iconKey: 'icon' },
  zzz: { method: 'get', endpoint: 'avatar/basic', listKey: 'avatar_list', nameKey: 'name_mi18n', iconKey: 'role_square_url' },
};

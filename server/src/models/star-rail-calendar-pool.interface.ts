import type { StarRailTimeInfo } from './star-rail-time-info.interface.ts';

/** Un salto (gachapón) del calendario de Star Rail. */
export interface StarRailCalendarPool {
  version: string;
  time_info: StarRailTimeInfo;
  avatar_list?: { item_name: string; rarity: string }[];
  equip_list?: { item_name: string; rarity: string }[];
}

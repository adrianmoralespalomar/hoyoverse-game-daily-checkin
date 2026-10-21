import type { ServerDateTime } from './server-date-time.interface.ts';

/** Un gachapón del calendario de Genshin. Los `*_timestamp` son segundos Unix en texto. */
export interface GenshinCalendarPool {
  version_name: string;
  start_timestamp: string;
  end_timestamp: string;
  start_time: ServerDateTime;
  avatars?: { name: string; rarity: number }[];
  weapon?: { name: string; rarity: number }[];
}

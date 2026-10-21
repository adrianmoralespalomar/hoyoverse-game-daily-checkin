import type { ServerDateTime } from './server-date-time.interface.ts';

/** `data` de `hadal_mem_detail_v2` (Asalto letal) de ZZZ. */
export interface ZenlessDeadlyAssaultData {
  has_data: boolean;
  total_star: number;
  total_score: number;
  end_time: ServerDateTime;
}

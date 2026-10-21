/** `data` de las notas en tiempo real de Genshin (campos que se usan; nombres de HoYoLAB, según genshin.py). */
export interface GenshinNotesData {
  current_resin?: number;
  max_resin?: number;
  resin_recovery_time?: string | number;
  current_home_coin?: number;
  max_home_coin?: number;
  home_coin_recovery_time?: string | number;
  finished_task_num?: number;
  total_task_num?: number;
  remain_resin_discount_num?: number;
  resin_discount_num_limit?: number;
  max_expedition_num?: number;
  expeditions?: { status?: string; remained_time?: string | number }[];
}

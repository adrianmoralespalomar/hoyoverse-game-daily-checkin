/** `data` de las notas en tiempo real de Star Rail (campos que se usan; nombres de HoYoLAB, según genshin.py). */
export interface StarRailNotesData {
  current_stamina?: number;
  max_stamina?: number;
  stamina_recover_time?: string | number;
  current_reserve_stamina?: number;
  current_train_score?: number;
  max_train_score?: number;
  current_rogue_score?: number;
  max_rogue_score?: number;
  weekly_cocoon_cnt?: number;
  weekly_cocoon_limit?: number;
  total_expedition_num?: number;
  expeditions?: { status?: string; remaining_time?: string | number }[];
}

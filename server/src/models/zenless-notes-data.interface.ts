/** `data` de las notas en tiempo real de Zenless (campos que se usan; nombres de HoYoLAB, según genshin.py). */
export interface ZenlessNotesData {
  energy?: { progress?: { max?: number; current?: number }; restore?: string | number };
  vitality?: { max?: number; current?: number };
  bounty_commission?: { num?: number; total?: number };
  survey_points?: { num?: number; total?: number };
  weekly_task?: { cur_point?: number; max_point?: number };
}

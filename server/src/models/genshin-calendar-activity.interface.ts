/** Un evento o modo del calendario de Genshin. Los `*_timestamp` son segundos Unix en texto. */
export interface GenshinCalendarActivity {
  name: string;
  /** `ActTypeOther`, `ActTypeTower` (Abismo), `ActTypeRoleCombat` (Teatro), `ActTypeHardChallenge` (Asalto estigio)... */
  type: string;
  start_timestamp: string;
  /** `"0"` si no termina. */
  end_timestamp: string;
  is_finished: boolean;
  reward_list?: { item_id: number; num: number }[];
  /** `max_star` son tus estrellas; `total_star`, las que hay. */
  tower_detail?: { max_star: number; total_star: number; has_data: boolean };
  role_combat_detail?: { max_round_id: number; difficulty_id: number; has_data: boolean };
  hard_challenge_detail?: { difficulty: number };
}

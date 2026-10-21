/** Un canal (gachapón) del calendario de ZZZ. `start_ts` y `end_ts` son segundos Unix. */
export interface ZenlessGachaSchedule {
  version: string;
  start_ts: number;
  end_ts: number;
  /** `full_name` llega vacío en los agentes aún sin anunciar. */
  avatar_list?: { avatar_name: string; full_name: string; rarity: string }[];
  /** Los motores no traen nombre. */
  weapon_list?: { rarity: string }[];
}

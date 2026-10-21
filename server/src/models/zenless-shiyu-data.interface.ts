/** `data` de `hadal_info_v2` (Defensa de Shiyu) de ZZZ. `begin_time` y `end_time` son segundos Unix en texto. */
export interface ZenlessShiyuData {
  hadal_info_v2?: {
    begin_time: string;
    end_time: string;
    /** No viene si aún no has jugado el periodo. */
    brief?: { score: number; max_score: number; rating: string };
  };
}

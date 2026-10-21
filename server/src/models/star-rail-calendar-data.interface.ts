import type { StarRailCalendarPool } from './star-rail-calendar-pool.interface.ts';
import type { StarRailTimeInfo } from './star-rail-time-info.interface.ts';

/** `data` de `get_act_calender` de Star Rail (solo lo que se usa). */
export interface StarRailCalendarData {
  cur_game_version: string;
  avatar_card_pool_list?: StarRailCalendarPool[];
  equip_card_pool_list?: StarRailCalendarPool[];
  act_list?: {
    name: string;
    /** `ActivityTypeOther`, `ActivityTypeDouble`, `ActivityTypeSign`... */
    act_type: string;
    /** `OtherActStatusUnFinish`, `OtherActStatusFinish`... */
    act_status: string;
    time_info: StarRailTimeInfo;
    reward_list?: { item_id: number; num: number }[];
  }[];
  /** Memoria del Caos, Ficción Pura, Sombra Apocalíptica y Arbitraje de Anomalías, con tu progreso. */
  challenge_list?: {
    name_mi18n: string;
    /** `ChallengeTypeChasm`, `ChallengeTypeStory`, `ChallengeTypeBoss`, `ChallengeTypePeak`. */
    challenge_type: string;
    /** `challengeStatusInProgress`, `challengeStatusFinish`, `challengeStatusUnopened`. */
    status: string;
    current_progress: number;
    total_progress: number;
    time_info: StarRailTimeInfo;
    reward_list?: { item_id: number; num: number }[];
  }[];
}

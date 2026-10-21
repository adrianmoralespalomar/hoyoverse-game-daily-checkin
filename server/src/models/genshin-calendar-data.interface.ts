import type { GenshinCalendarActivity } from './genshin-calendar-activity.interface.ts';
import type { GenshinCalendarPool } from './genshin-calendar-pool.interface.ts';

/** `data` de `act_calendar` de Genshin (solo lo que se usa). */
export interface GenshinCalendarData {
  avatar_card_pool_list?: GenshinCalendarPool[];
  weapon_card_pool_list?: GenshinCalendarPool[];
  mixed_card_pool_list?: GenshinCalendarPool[];
  act_list?: GenshinCalendarActivity[];
  /** Abismo y Teatro Fantasía. */
  fixed_act_list?: GenshinCalendarActivity[];
}

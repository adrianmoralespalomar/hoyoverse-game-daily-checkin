import type { ZenlessGachaSchedule } from './zenless-gacha-schedule.interface.ts';

/** `data` de `gacha_calendar` de ZZZ. Trae las dos mitades de la versión. */
export interface ZenlessGachaCalendarData {
  avatar_gacha_schedule_list?: ZenlessGachaSchedule[];
  weapon_gacha_schedule_list?: ZenlessGachaSchedule[];
}

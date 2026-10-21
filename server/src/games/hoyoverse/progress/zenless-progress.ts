import { deriveGameVersion, serverTimeToIso, unixSecondsToIso } from '../../../core/game-time.ts';
import type { EndgameMode } from '../../../models/endgame-mode.interface.ts';
import type { GameBannerKind } from '../../../models/game-banner-kind.type.ts';
import type { GameProgress } from '../../../models/game-progress.interface.ts';
import type { GameRecordClient } from '../../../models/game-record-client.interface.ts';
import type { ZenlessActivityCalendarData } from '../../../models/zenless-activity-calendar-data.interface.ts';
import type { ZenlessDeadlyAssaultData } from '../../../models/zenless-deadly-assault-data.interface.ts';
import { ZENLESS_DEADLY_ASSAULT_MAX_STARS } from '../../../models/zenless-deadly-assault-max-stars.const.ts';
import type { ZenlessGachaCalendarData } from '../../../models/zenless-gacha-calendar-data.interface.ts';
import type { ZenlessGachaSchedule } from '../../../models/zenless-gacha-schedule.interface.ts';
import type { ZenlessShiyuData } from '../../../models/zenless-shiyu-data.interface.ts';
import { isActiveAt } from './progress-helpers.ts';

/**
 * ZZZ no tiene un calendario con todo: son cuatro consultas. Los modos no dicen cuántas películas dan, así que
 * solo se enseña el progreso.
 */
export async function fetchZenlessProgress(client: GameRecordClient, now: number): Promise<GameProgress> {
  const shiyu = await client.get<ZenlessShiyuData>('hadal_info_v2', { schedule_type: '1' });
  const assault = await client.get<ZenlessDeadlyAssaultData>('hadal_mem_detail_v2', { schedule_type: '1' }, 'uid');
  const activities = await client.get<ZenlessActivityCalendarData>('activity_calendar', {}, 'uid');
  const gacha = await client.get<ZenlessGachaCalendarData>('gacha_calendar', {}, 'uid');
  const schedulesByKind: [GameBannerKind, ZenlessGachaSchedule[] | undefined][] = [
    ['character', gacha.avatar_gacha_schedule_list],
    ['weapon', gacha.weapon_gacha_schedule_list],
  ];
  const schedules = schedulesByKind.flatMap(([kind, list]) => (list ?? []).map(schedule => ({ kind, schedule })));
  const activeSchedules = schedules.filter(({ schedule }) => isActiveAt(schedule.start_ts, schedule.end_ts, now));
  const currentVersion = activeSchedules[0]?.schedule.version;
  const versionPools = schedules
    .filter(({ schedule }) => schedule.version === currentVersion)
    .map(({ schedule }) => ({ startsAt: unixSecondsToIso(schedule.start_ts)!, endsAt: unixSecondsToIso(schedule.end_ts)! }));
  return {
    fetchedAt: new Date(now).toISOString(),
    version: currentVersion ? deriveGameVersion(currentVersion, versionPools, false) : null,
    banners: activeSchedules.map(({ kind, schedule }) => ({
      kind,
      featured: (schedule.avatar_list ?? []).filter(avatar => avatar.rarity === 'S').map(avatar => avatar.full_name || avatar.avatar_name).filter(Boolean),
      startsAt: unixSecondsToIso(schedule.start_ts)!,
      endsAt: unixSecondsToIso(schedule.end_ts)!,
    })),
    endgame: [toShiyuMode(shiyu), toDeadlyAssaultMode(assault)].filter(mode => mode !== null),
    pendingEvents: (activities.activity_list ?? [])
      .filter(activity => isActiveAt(activity.start_ts, activity.end_ts, now))
      .map(activity => ({ name: activity.name, currency: activity.monochrome_cnt - activity.monochrome_got_cnt, endsAt: unixSecondsToIso(activity.end_ts) }))
      .filter(event => event.currency > 0),
  };
}

function toShiyuMode({ hadal_info_v2: shiyu }: ZenlessShiyuData): EndgameMode | null {
  if (!shiyu) return null;
  const { brief } = shiyu;
  return {
    name: 'Defensa de Shiyu',
    progressLabel: brief ? `${brief.score.toLocaleString('es-ES')} / ${brief.max_score.toLocaleString('es-ES')} (${brief.rating})` : 'Sin jugar',
    progress: brief?.max_score ? brief.score / brief.max_score : 0,
    isComplete: !!brief && brief.score >= brief.max_score,
    endsAt: unixSecondsToIso(shiyu.end_time),
    currencyTotal: null,
    currencyLeft: null,
  };
}

function toDeadlyAssaultMode(assault: ZenlessDeadlyAssaultData): EndgameMode {
  const stars = assault.has_data ? assault.total_star : 0;
  return {
    name: 'Asalto letal',
    progressLabel: assault.has_data ? `${stars}/${ZENLESS_DEADLY_ASSAULT_MAX_STARS} ★` : 'Sin jugar',
    progress: stars / ZENLESS_DEADLY_ASSAULT_MAX_STARS,
    isComplete: stars >= ZENLESS_DEADLY_ASSAULT_MAX_STARS,
    endsAt: serverTimeToIso(assault.end_time),
    currencyTotal: null,
    currencyLeft: null,
  };
}

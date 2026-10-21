import { deriveGameVersion, estimateCurrencyLeft, unixSecondsToIso } from '../../../core/game-time.ts';
import type { GameBannerKind } from '../../../models/game-banner-kind.type.ts';
import type { GameProgress } from '../../../models/game-progress.interface.ts';
import type { GameRecordClient } from '../../../models/game-record-client.interface.ts';
import type { StarRailCalendarData } from '../../../models/star-rail-calendar-data.interface.ts';
import type { StarRailCalendarPool } from '../../../models/star-rail-calendar-pool.interface.ts';
import { STAR_RAIL_CHALLENGE_NAMES } from '../../../models/star-rail-challenge-names.const.ts';
import { currencyInRewards, isActiveAt } from './progress-helpers.ts';

/** Todo sale del calendario: banners, eventos y los cuatro modos de contenido final con tu progreso. */
export async function fetchStarRailProgress(client: GameRecordClient, currencyItemId: number, now: number): Promise<GameProgress> {
  const calendar = await client.get<StarRailCalendarData>('get_act_calender');
  const poolsByKind: [GameBannerKind, StarRailCalendarPool[] | undefined][] = [
    ['character', calendar.avatar_card_pool_list],
    ['weapon', calendar.equip_card_pool_list],
  ];
  const banners = poolsByKind.flatMap(([kind, list]) => (list ?? []).map(pool => ({
    kind,
    version: pool.version,
    featured: [...pool.avatar_list ?? [], ...pool.equip_list ?? []].filter(item => item.rarity === '5').map(item => item.item_name),
    startsAt: unixSecondsToIso(pool.time_info.start_ts)!,
    endsAt: unixSecondsToIso(pool.time_info.end_ts)!,
    isActive: isActiveAt(pool.time_info.start_ts, pool.time_info.end_ts, now),
  })));
  const challenges = (calendar.challenge_list ?? [])
    .filter(challenge => challenge.status !== 'challengeStatusUnopened' && isActiveAt(challenge.time_info.start_ts, challenge.time_info.end_ts, now));
  return {
    fetchedAt: new Date(now).toISOString(),
    version: deriveGameVersion(calendar.cur_game_version, banners.filter(banner => banner.version === calendar.cur_game_version), false),
    banners: banners.filter(banner => banner.isActive).map(({ kind, featured, startsAt, endsAt }) => ({ kind, featured, startsAt, endsAt })),
    endgame: challenges.map(challenge => {
      const progress = challenge.total_progress ? challenge.current_progress / challenge.total_progress : null;
      const currencyTotal = currencyInRewards(challenge.reward_list, currencyItemId) || null;
      return {
        name: STAR_RAIL_CHALLENGE_NAMES[challenge.challenge_type] ?? challenge.name_mi18n,
        subtitle: challenge.name_mi18n,
        progressLabel: `${challenge.current_progress}/${challenge.total_progress} ★`,
        progress,
        isComplete: challenge.status === 'challengeStatusFinish',
        endsAt: unixSecondsToIso(challenge.time_info.end_ts),
        currencyTotal,
        currencyLeft: estimateCurrencyLeft(currencyTotal, progress),
      };
    }),
    pendingEvents: (calendar.act_list ?? [])
      .filter(activity => activity.act_type === 'ActivityTypeOther' && activity.act_status.endsWith('UnFinish'))
      .filter(activity => isActiveAt(activity.time_info.start_ts, activity.time_info.end_ts, now))
      .map(activity => ({ name: activity.name, currency: currencyInRewards(activity.reward_list, currencyItemId), endsAt: unixSecondsToIso(activity.time_info.end_ts) }))
      .filter(event => event.currency > 0),
  };
}

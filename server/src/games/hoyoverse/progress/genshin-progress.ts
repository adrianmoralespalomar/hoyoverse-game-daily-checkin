import { deriveGameVersion, estimateCurrencyLeft, unixSecondsToIso } from '../../../core/game-time.ts';
import type { EndgameMode } from '../../../models/endgame-mode.interface.ts';
import type { GameBanner } from '../../../models/game-banner.interface.ts';
import type { GameBannerKind } from '../../../models/game-banner-kind.type.ts';
import type { GameProgress } from '../../../models/game-progress.interface.ts';
import type { GameRecordClient } from '../../../models/game-record-client.interface.ts';
import type { GenshinCalendarActivity } from '../../../models/genshin-calendar-activity.interface.ts';
import type { GenshinCalendarData } from '../../../models/genshin-calendar-data.interface.ts';
import type { GenshinCalendarPool } from '../../../models/genshin-calendar-pool.interface.ts';
import { GENSHIN_THEATER_DIFFICULTIES } from '../../../models/genshin-theater-difficulties.const.ts';
import { currencyInRewards, isActiveAt } from './progress-helpers.ts';

/** Todo sale de una sola consulta: el calendario trae banners, eventos, Abismo, Teatro y Asalto estigio. */
export async function fetchGenshinProgress(client: GameRecordClient, currencyItemId: number, now: number): Promise<GameProgress> {
  const calendar = await client.post<GenshinCalendarData>('act_calendar');
  const poolsByKind: [GameBannerKind, GenshinCalendarPool[] | undefined][] = [
    ['character', calendar.avatar_card_pool_list],
    ['weapon', calendar.weapon_card_pool_list],
    ['chronicled', calendar.mixed_card_pool_list],
  ];
  const pools = poolsByKind.flatMap(([kind, list]) => (list ?? []).map(pool => ({ kind, pool })));
  const banners: GameBanner[] = pools.map(({ kind, pool }) => ({
    kind,
    featured: [...pool.avatars ?? [], ...pool.weapon ?? []].filter(item => item.rarity === 5).map(item => item.name),
    startsAt: unixSecondsToIso(pool.start_timestamp)!,
    endsAt: unixSecondsToIso(pool.end_timestamp)!,
  }));
  // La segunda mitad de cada versión de Genshin abre a las 18:00 del servidor; la primera, al acabar el mantenimiento
  const isSecondHalf = pools.some(({ pool }) => pool.start_time.hour === 18);
  const activities = [...calendar.fixed_act_list ?? [], ...calendar.act_list ?? []];
  return {
    fetchedAt: new Date(now).toISOString(),
    version: pools.length ? deriveGameVersion(pools[0].pool.version_name, banners, isSecondHalf) : null,
    banners,
    endgame: activities.map(activity => toEndgameMode(activity, currencyItemId)).filter(mode => mode !== null),
    pendingEvents: activities
      .filter(activity => activity.type === 'ActTypeOther' && !activity.is_finished && isActiveAt(activity.start_timestamp, activity.end_timestamp, now))
      .map(activity => ({ name: activity.name, currency: currencyInRewards(activity.reward_list, currencyItemId), endsAt: unixSecondsToIso(activity.end_timestamp) }))
      .filter(event => event.currency > 0),
  };
}

function toEndgameMode(activity: GenshinCalendarActivity, currencyItemId: number): EndgameMode | null {
  const base = {
    name: activity.name,
    endsAt: unixSecondsToIso(activity.end_timestamp),
    currencyTotal: currencyInRewards(activity.reward_list, currencyItemId) || null,
  };
  if (activity.tower_detail) {
    const { max_star: stars, total_star: maxStars } = activity.tower_detail;
    const progress = maxStars ? stars / maxStars : null;
    return { ...base, progressLabel: `${stars}/${maxStars} ★`, progress, isComplete: stars >= maxStars, currencyLeft: estimateCurrencyLeft(base.currencyTotal, progress) };
  }
  if (activity.role_combat_detail) {
    const { has_data: hasData, max_round_id: round, difficulty_id: difficulty } = activity.role_combat_detail;
    const progressLabel = hasData ? `Acto ${round}, dificultad ${GENSHIN_THEATER_DIFFICULTIES[difficulty] ?? difficulty}` : 'Sin jugar';
    return { ...base, progressLabel, progress: null, isComplete: false, currencyLeft: hasData ? null : base.currencyTotal };
  }
  if (activity.hard_challenge_detail) {
    const { difficulty } = activity.hard_challenge_detail;
    return { ...base, progressLabel: difficulty ? `Dificultad ${difficulty}` : 'Sin jugar', progress: null, isComplete: false, currencyLeft: difficulty ? null : base.currencyTotal };
  }
  return null;
}

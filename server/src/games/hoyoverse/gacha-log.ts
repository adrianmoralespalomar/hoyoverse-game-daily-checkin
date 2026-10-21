import { serverTimeTextToIso } from '../../core/game-time.ts';
import { waitRandomly } from '../../core/pacing.ts';
import type { GachaLogData } from '../../models/gacha-log-data.interface.ts';
import { GACHA_LOG_PACING } from '../../models/gacha-log-pacing.const.ts';
import { GACHA_LOG_RETCODE_MESSAGES } from '../../models/gacha-log-retcode-messages.const.ts';
import type { HoyoverseGameConfig } from '../../models/hoyoverse-game-config.interface.ts';
import type { HoyoverseResponse } from '../../models/hoyoverse-response.interface.ts';
import { REQUEST_PACING } from '../../models/request-pacing.const.ts';
import type { WishBannerKind } from '../../models/wish-banner-kind.type.ts';
import type { WishRecord } from '../../models/wish-record.interface.ts';

/** Si el enlace pegado es del historial de este juego: por `game_biz` o, si no lo trae, por la ruta. */
export function isGachaLinkOfGame(game: HoyoverseGameConfig, link: string): boolean {
  return link.includes(`game_biz=${game.redeem.gameBiz}`) || (!link.includes('game_biz=') && game.gachaLog.linkPathPattern.test(link.split('?')[0]));
}

/**
 * Tiradas que aún no están en `knownIds`, de todos los gachapones. Recorre cada uno de la más nueva hacia atrás y
 * para al llegar a una conocida, así que solo la primera vez trae el historial entero.
 */
export async function fetchNewWishes(game: HoyoverseGameConfig, authkey: string, knownIds: Set<string>): Promise<WishRecord[]> {
  const records: WishRecord[] = [];
  for (const { gachaType, kind } of game.gachaLog.banners) {
    let endId = '0';
    for (let page = 1; page <= GACHA_LOG_PACING.maxPages; page++) {
      await waitRandomly(GACHA_LOG_PACING.betweenPagesMs);
      const list = await fetchGachaLogPage(game, authkey, gachaType, endId);
      const newItems = list.filter(item => !knownIds.has(item.id));
      records.push(...newItems.map(item => toWishRecord(item, kind)));
      if (list.length < GACHA_LOG_PACING.pageSize || newItems.length < list.length) break;
      endId = list.at(-1)!.id;
    }
  }
  return records;
}

async function fetchGachaLogPage(game: HoyoverseGameConfig, authkey: string, gachaType: string, endId: string): Promise<NonNullable<GachaLogData['list']>> {
  const url = new URL(game.gachaLog.url);
  const params = {
    authkey_ver: '1',
    sign_type: '2',
    auth_appid: 'webview_gacha',
    authkey,
    lang: 'en',
    game_biz: game.redeem.gameBiz,
    gacha_type: gachaType,
    real_gacha_type: gachaType,
    size: String(GACHA_LOG_PACING.pageSize),
    end_id: endId,
  };
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_PACING.timeoutMs) });
    const json = await response.json().catch(() => null) as HoyoverseResponse<GachaLogData> | null;
    if (!json) throw new Error(`Respuesta inesperada del historial (HTTP ${response.status})`);
    if (json.retcode === 0) return json.data?.list ?? [];
    if (json.retcode !== GACHA_LOG_PACING.tooFrequentRetcode || attempt >= GACHA_LOG_PACING.maxRetries) {
      throw new Error(GACHA_LOG_RETCODE_MESSAGES[json.retcode ?? NaN] ?? `El historial respondió ${json.retcode}: ${json.message ?? 'sin mensaje'}`);
    }
    await waitRandomly(GACHA_LOG_PACING.tooFrequentRetryMs);
  }
}

function toWishRecord(item: NonNullable<GachaLogData['list']>[number], kind: WishBannerKind): WishRecord {
  return { id: item.id, at: serverTimeTextToIso(item.time), name: item.name, rank: item.rank_type, kind };
}

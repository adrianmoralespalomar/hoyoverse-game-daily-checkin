import type { GameVersion } from '../models/game-version.interface.ts';
import { LAST_TOP_PULLS_SHOWN } from '../models/last-top-pulls-shown.const.ts';
import type { WishBannerSummary } from '../models/wish-banner-summary.interface.ts';
import { WISH_HARD_PITY } from '../models/wish-hard-pity.const.ts';
import type { WishHistoryCapability } from '../models/wish-history-capability.interface.ts';
import type { WishRecord } from '../models/wish-record.interface.ts';

/**
 * Pity y 50/50 de cada gachapón. Un 5★ del estándar en el de personaje es un 50/50 perdido (y el siguiente va
 * garantizado). Los estándar son los de la lista más los que te hayan salido en el gachapón estándar.
 */
export function summarizeWishBanners(records: WishRecord[], rules: WishHistoryCapability, version: GameVersion | null): WishBannerSummary[] {
  const standardNames = new Set([
    ...rules.standardCharacters,
    ...records.filter(record => record.kind === 'standard' && record.rank === rules.topRank).map(record => record.name),
  ].map(name => name.toLowerCase()));
  const versionStartMs = version ? Date.parse(version.startsAt) : Infinity;
  return rules.bannerKinds.map(kind => {
    const bannerRecords = records.filter(record => record.kind === kind);
    const topPulls: WishBannerSummary['lastTopPulls'] = [];
    let pity = 0;
    let isGuaranteed = false;
    for (const record of bannerRecords) {
      pity++;
      if (record.rank !== rules.topRank) continue;
      const isStandard = standardNames.has(record.name.toLowerCase());
      const wonFiftyFifty = kind === 'character' && !isGuaranteed ? !isStandard : null;
      topPulls.push({ name: record.name, pity, at: record.at, wonFiftyFifty });
      isGuaranteed = kind === 'character' && isStandard;
      pity = 0;
    }
    return {
      kind,
      pity,
      hardPity: WISH_HARD_PITY[kind],
      isGuaranteed: kind === 'character' ? isGuaranteed : null,
      lastTopPulls: topPulls.slice(-LAST_TOP_PULLS_SHOWN).reverse(),
      totalPulls: bannerRecords.length,
      pullsThisVersion: bannerRecords.filter(record => Date.parse(record.at) >= versionStartMs).length,
    };
  }).filter(banner => banner.totalPulls > 0);
}

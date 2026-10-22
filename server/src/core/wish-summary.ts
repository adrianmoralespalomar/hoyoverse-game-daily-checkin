import type { GameVersion } from '../models/game-version.interface.ts';
import type { WishBannerSummary } from '../models/wish-banner-summary.interface.ts';
import { WISH_HARD_PITY } from '../models/wish-hard-pity.const.ts';
import type { WishHistoryCapability } from '../models/wish-history-capability.interface.ts';
import type { WishRecord } from '../models/wish-record.interface.ts';
import type { WishTopPull } from '../models/wish-top-pull.interface.ts';

/**
 * Pity y 50/50 de cada gachapón. Un 5★ del estándar en el de personaje es un 50/50 perdido (y el siguiente va
 * garantizado). El primer 5★ del historial no se sabe si iba garantizado (el juego solo guarda unos meses): si es
 * del estándar fue seguro una derrota; si es destacado, queda sin saber. Los estándar son los de la lista más los que te hayan salido en el gachapón estándar.
 */
export function summarizeWishBanners(records: WishRecord[], rules: WishHistoryCapability, version: GameVersion | null, getIconUrl: (name: string) => string | null): WishBannerSummary[] {
  const standardNames = new Set([
    ...rules.standardCharacters,
    ...records.filter(record => record.kind === 'standard' && record.rank === rules.topRank).map(record => record.name),
  ].map(name => name.toLowerCase()));
  const versionStartMs = version ? Date.parse(version.startsAt) : Infinity;
  return rules.bannerKinds.map(kind => {
    const bannerRecords = records.filter(record => record.kind === kind);
    const topPulls: WishTopPull[] = [];
    let pity = 0;
    let isGuaranteed = false;
    for (const record of bannerRecords) {
      pity++;
      if (record.rank !== rules.topRank) continue;
      const isStandard = standardNames.has(record.name.toLowerCase());
      const isFirstInHistory = !topPulls.length;
      const wonFiftyFifty = kind !== 'character' || isGuaranteed || (isFirstInHistory && !isStandard) ? null : !isStandard;
      topPulls.push({ name: record.name, pity, at: record.at, wonFiftyFifty, isFirstInHistory, iconUrl: getIconUrl(record.name) });
      isGuaranteed = kind === 'character' && isStandard;
      pity = 0;
    }
    return {
      kind,
      pity,
      hardPity: WISH_HARD_PITY[kind],
      isGuaranteed: kind === 'character' ? isGuaranteed : null,
      topPulls: topPulls.reverse(),
      totalPulls: bannerRecords.length,
      pullsThisVersion: bannerRecords.filter(record => Date.parse(record.at) >= versionStartMs).length,
    };
  }).filter(banner => banner.totalPulls > 0);
}

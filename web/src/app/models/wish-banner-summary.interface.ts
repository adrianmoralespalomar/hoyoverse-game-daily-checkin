import type { WishBannerKind } from './wish-banner-kind.type';

/** Espejo de `server/src/models/wish-banner-summary.interface.ts`. */
export interface WishBannerSummary {
  kind: WishBannerKind;
  pity: number;
  hardPity: number;
  isGuaranteed: boolean | null;
  lastTopPulls: { name: string; pity: number; at: string; wonFiftyFifty: boolean | null }[];
  totalPulls: number;
  pullsThisVersion: number;
}

import type { WishBannerKind } from './wish-banner-kind.type';
import type { WishTopPull } from './wish-top-pull.interface';

/** Espejo de `server/src/models/wish-banner-summary.interface.ts`. */
export interface WishBannerSummary {
  kind: WishBannerKind;
  pity: number;
  hardPity: number;
  isGuaranteed: boolean | null;
  topPulls: WishTopPull[];
  totalPulls: number;
  pullsThisVersion: number;
}

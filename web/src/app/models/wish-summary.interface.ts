import type { WishBannerSummary } from './wish-banner-summary.interface';

/** Espejo de `server/src/models/wish-summary.interface.ts`. */
export interface WishSummary {
  updatedAt: string;
  updatedVersion: string | null;
  totalPulls: number;
  banners: WishBannerSummary[];
}

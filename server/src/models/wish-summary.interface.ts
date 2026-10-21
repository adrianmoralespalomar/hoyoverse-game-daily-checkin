import type { WishBannerSummary } from './wish-banner-summary.interface.ts';

/** Resumen del historial de tiradas para el panel (nunca las tiradas una a una). */
export interface WishSummary {
  updatedAt: string;
  totalPulls: number;
  /** Solo los gachapones en los que has tirado alguna vez. */
  banners: WishBannerSummary[];
}

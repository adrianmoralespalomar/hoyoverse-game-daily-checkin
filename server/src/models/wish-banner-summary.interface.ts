import type { WishBannerKind } from './wish-banner-kind.type.ts';

export interface WishBannerSummary {
  kind: WishBannerKind;
  /** Tiradas desde el último 5★. */
  pity: number;
  hardPity: number;
  /** Solo en el de personaje: el próximo 5★ es el destacado seguro (perdiste el último 50/50). */
  isGuaranteed: boolean | null;
  /** Los últimos 5★, el más reciente primero. `wonFiftyFifty` es `null` si iba garantizado o no aplica. */
  lastTopPulls: { name: string; pity: number; at: string; wonFiftyFifty: boolean | null }[];
  totalPulls: number;
  pullsThisVersion: number;
}

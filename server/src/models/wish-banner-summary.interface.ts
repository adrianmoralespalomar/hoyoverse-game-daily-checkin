import type { WishBannerKind } from './wish-banner-kind.type.ts';
import type { WishTopPull } from './wish-top-pull.interface.ts';

export interface WishBannerSummary {
  kind: WishBannerKind;
  /** Tiradas desde el último 5★. */
  pity: number;
  hardPity: number;
  /** Solo en el de personaje: el próximo 5★ es el destacado seguro (perdiste el último 50/50). */
  isGuaranteed: boolean | null;
  /** Todos los 5★ del historial, el más reciente primero. */
  topPulls: WishTopPull[];
  totalPulls: number;
  pullsThisVersion: number;
}

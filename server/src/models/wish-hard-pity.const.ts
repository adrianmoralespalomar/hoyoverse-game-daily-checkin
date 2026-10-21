import type { WishBannerKind } from './wish-banner-kind.type.ts';

/** Tiradas que garantizan el 5★ (rango S en ZZZ). Igual en los tres juegos. */
export const WISH_HARD_PITY: Record<WishBannerKind, number> = {
  character: 90,
  weapon: 80,
  standard: 90,
  chronicled: 90,
  bangboo: 80,
  beginner: 50,
};

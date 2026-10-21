import type { GameBannerKind } from './game-banner-kind.type.ts';

export interface GameBanner {
  kind: GameBannerKind;
  /** Personajes o armas de 5★ (rango S en ZZZ) destacados. */
  featured: string[];
  startsAt: string;
  endsAt: string;
}

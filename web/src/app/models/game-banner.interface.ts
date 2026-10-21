import type { GameBannerKind } from './game-banner-kind.type';

/** Espejo de `server/src/models/game-banner.interface.ts`. */
export interface GameBanner {
  kind: GameBannerKind;
  featured: string[];
  startsAt: string;
  endsAt: string;
}

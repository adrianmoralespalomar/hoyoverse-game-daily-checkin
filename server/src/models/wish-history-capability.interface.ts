import type { WishBannerKind } from './wish-banner-kind.type.ts';
import type { WishRecord } from './wish-record.interface.ts';

/** Lo que necesita el historial de tiradas de un juego. */
export interface WishHistoryCapability {
  matchesLink: (link: string) => boolean;
  /** Lanza si el enlace ha caducado o HoYoverse no responde. */
  fetchNewWishes: (authkey: string, knownIds: Set<string>) => Promise<WishRecord[]>;
  /** `rank_type` del 5★ (rango S en ZZZ). */
  topRank: string;
  standardCharacters: string[];
  /** En el orden en que se enseñan. */
  bannerKinds: WishBannerKind[];
}

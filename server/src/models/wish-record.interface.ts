import type { WishBannerKind } from './wish-banner-kind.type.ts';

/** Una tirada del historial. Los nombres van en inglés (se piden así para reconocer los del gachapón estándar). */
export interface WishRecord {
  /** Crece con cada tirada: ordena el historial. */
  id: string;
  at: string;
  name: string;
  /** `rank_type` tal cual: `5`/`4`/`3` en Genshin y Star Rail; `4` (S), `3` (A), `2` (B) en ZZZ. */
  rank: string;
  kind: WishBannerKind;
}

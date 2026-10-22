import type { GameId } from './game-id.type.ts';
import type { WishBannerKind } from './wish-banner-kind.type.ts';

/** Cómo hablar con HoYoLAB y con la web de canje de un juego de HoYoverse. Sale del tráfico real de cada web. */
export interface HoyoverseGameConfig {
  id: GameId;
  name: string;
  /** Servidor de Europa (lo usan el canje y las notas en tiempo real). */
  region: string;
  checkIn: {
    signUrl: string;
    infoUrl: string;
    homeUrl: string;
    actId: string;
  };
  redeem: {
    /** Genshin manda todo por la URL (GET); HSR y ZZZ, un JSON (POST) a la versión `Risk` del endpoint. */
    method: 'GET' | 'POST';
    url: string;
    gameBiz: string;
    /** Web oficial de canje: va como `Origin` y `Referer`, igual que desde el navegador. */
    siteOrigin: string;
  };
  /** Notas en tiempo real de la Crónica de batalla (resina, energía...). Piden la firma DS. */
  notesUrl: string;
  /** Base de la Crónica de batalla: calendario y contenido final. */
  recordApiUrl: string;
  /** `item_id` de la moneda de tiradas (protogemas, jade estelar) en las recompensas del calendario. */
  currencyItemId: number;
  /** Diario de ingresos. Star Rail lo da solo con la cookie de canje; se mandan las dos en los tres juegos. */
  ledger: {
    url: string;
    /** Genshin pide el mes como número (`10`); los otros, `202610`. */
    monthFormat: 'month' | 'year-month';
    /** `type` del detalle que corresponde a la moneda de tiradas. */
    currencyType: string;
  };
  /** Hoja de la comunidad con las tiradas F2P de cada versión, en CSV público. */
  f2pSheetCsvUrl: string;
  /** Historial de tiradas. Va con la `authkey` del enlace que abre el juego, sin cookies. */
  gachaLog: {
    url: string;
    /** Para reconocer el juego en el enlace pegado si no trae `game_biz` (lo que va antes de `?`). */
    linkPathPattern: RegExp;
    /** `rank_type` del 5★ (rango S en ZZZ). */
    topRank: string;
    /** `gacha_type` de cada gachapón. En Genshin, el 301 trae también el segundo de personaje (400). */
    banners: { gachaType: string; kind: WishBannerKind }[];
  };
  /** Nombre del juego en hoyo-codes.seria.moe. */
  codesApiGame: string;
  uidEnvVariable: string;
}

import type { GameId } from './game-id.type.ts';

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
  /** Nombre del juego en hoyo-codes.seria.moe. */
  codesApiGame: string;
  uidEnvVariable: string;
}

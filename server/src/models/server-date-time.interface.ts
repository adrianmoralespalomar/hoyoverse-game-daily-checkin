/** Fecha que HoYoLAB manda por partes, en la hora del servidor del juego (Europa: UTC+1 todo el año). */
export interface ServerDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
}

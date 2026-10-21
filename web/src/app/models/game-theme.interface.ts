/** Lo que el panel añade a cada juego: su color, su moneda y las webs oficiales para hacer las cosas a mano. */
export interface GameTheme {
  accent: string;
  shortName: string;
  /** En plural y minúscula: "protogemas". */
  currencyName: string;
  /** Rareza más alta: "5★", o "S" en ZZZ. */
  topRankLabel: string;
  checkInUrl: string;
  redeemUrl: string;
  /** Equipos que usa la comunidad en el contenido final. */
  endgameGuideUrl: string;
  endgameGuideName: string;
}

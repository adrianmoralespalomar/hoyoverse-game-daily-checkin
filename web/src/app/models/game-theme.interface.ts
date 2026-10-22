/** Lo que el panel añade a cada juego: su color, su moneda y las webs oficiales para hacer las cosas a mano. */
export interface GameTheme {
  accent: string;
  /** Logo del juego, de la carpeta pública del panel. */
  logoUrl: string;
  shortName: string;
  /** En plural y minúscula: "protogemas". */
  currencyName: string;
  /** Rareza más alta: "5★", o "S" en ZZZ. */
  topRankLabel: string;
  /** Nombres de lo de pago en ese juego: la bendición/pase mensual y el pase de batalla. */
  monthlyCardName: string;
  battlePassName: string;
  /** Hoja de la comunidad con las tiradas F2P de cada versión. */
  f2pSheetUrl: string;
  f2pSheetName: string;
  checkInUrl: string;
  redeemUrl: string;
  /** Equipos que usa la comunidad en el contenido final. */
  endgameGuideUrl: string;
  endgameGuideName: string;
}

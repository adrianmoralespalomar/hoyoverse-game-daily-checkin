/** Un 5★ del historial. */
export interface WishTopPull {
  name: string;
  /** Tiradas que costó. Es un mínimo si `isFirstInHistory`: antes de él puede haber tiradas que el juego ya no guarda. */
  pity: number;
  at: string;
  /** Solo en el gachapón de personaje: `true` ganó el 50/50, `false` lo perdió. `null` si iba garantizado, no aplica o no se puede saber. */
  wonFiftyFifty: boolean | null;
  /** Es el más antiguo que guarda el juego: no se sabe si iba garantizado ni cuánto pity traía. */
  isFirstInHistory: boolean;
  /** Icono del personaje, si se tiene (solo personajes que has tenido). */
  iconUrl: string | null;
}

/** Espejo de `server/src/models/wish-top-pull.interface.ts`. */
export interface WishTopPull {
  name: string;
  pity: number;
  at: string;
  wonFiftyFifty: boolean | null;
  isFirstInHistory: boolean;
  iconUrl: string | null;
}

import type { WishBannerKind } from '../models/wish-banner-kind.type';
import type { WishTopPull } from '../models/wish-top-pull.interface';

/** Frase para el título de un 5★ del historial: cómo salió respecto al 50/50. `null` si no hay nada que decir. */
export function describeTopPull(bannerKind: WishBannerKind, pull: WishTopPull): string | null {
  if (bannerKind !== 'character') return null;
  if (pull.wonFiftyFifty === true) return '50/50 ganado';
  if (pull.wonFiftyFifty === false) return '50/50 perdido';
  return pull.isFirstInHistory ? 'El más antiguo que guarda el juego: no se sabe si iba garantizado' : 'Garantizado';
}

import type { GameBanner } from './game-banner.interface';

/** Un banner con lo que el panel enseña de él. */
export interface BannerView extends GameBanner {
  kindLabel: string;
  daysLeftText: string;
  /** Lo que lleva abierto, de 0 a 100. */
  elapsedPercent: number;
  isEndingSoon: boolean;
}

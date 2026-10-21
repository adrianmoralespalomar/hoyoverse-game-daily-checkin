import type { GameId } from './game-id.type.ts';

/** Segundos por punto de energía: resina 8 min, poder trazacaminos y batería 6 min. */
export const STAMINA_REGEN_SECONDS: Record<GameId, number> = {
  gi: 480,
  hsr: 360,
  zzz: 360,
};

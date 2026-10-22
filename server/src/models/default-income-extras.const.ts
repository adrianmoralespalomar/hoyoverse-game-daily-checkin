import type { GameId } from './game-id.type.ts';
import type { IncomeExtras } from './income-extras.interface.ts';

/** Con lo que se empieza hasta que se cambie en el panel. La API de HoYoLAB no dice si se tiene. */
export const DEFAULT_INCOME_EXTRAS: Record<GameId, IncomeExtras> = {
  gi: { monthlyCard: true, battlePass: false },
  hsr: { monthlyCard: false, battlePass: false },
  zzz: { monthlyCard: false, battlePass: false },
};

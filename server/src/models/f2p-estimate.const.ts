import type { GameId } from './game-id.type.ts';

export const F2P_ESTIMATE = {
  /** La bendición/pase mensual da 90 de moneda al día y 300 al comprarla: unos 100 al día, igual en los tres juegos. */
  monthlyCardCurrencyPerDay: 100,
  /** Si la versión aún no está en la hoja, se usa la media de las últimas. */
  averageVersionsCount: 6,
  /** Tiradas del pase de batalla de pago si la hoja no las separa o no tiene la versión (valores de la hoja). */
  battlePassPulls: { gi: 8.25, hsr: 8.3, zzz: 9.3 } satisfies Record<GameId, number>,
} as const;

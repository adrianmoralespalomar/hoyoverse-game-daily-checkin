/** Ritmo del historial: 20 tiradas por página, como la web del juego. Con prisa responde `-110`. */
export const GACHA_LOG_PACING = {
  pageSize: 20,
  betweenPagesMs: { min: 600, max: 1_200 },
  /** Tras un `-110` (demasiado seguido). */
  tooFrequentRetryMs: { min: 5_000, max: 8_000 },
  tooFrequentRetcode: -110,
  maxRetries: 3,
  /** Tope por gachapón (unas 10.000 tiradas). */
  maxPages: 500,
  /** El enlace dura 24 horas; se sigue usando para traer las tiradas nuevas hasta un poco antes. */
  authkeyLifetimeMs: 23 * 3_600_000,
} as const;

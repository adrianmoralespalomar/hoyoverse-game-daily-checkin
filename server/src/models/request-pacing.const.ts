/** Pausas para ir a ritmo humano y respetar la espera de HoYoverse entre canjes. */
export const REQUEST_PACING = {
  betweenCheckInsMs: { min: 2_000, max: 6_000 },
  /** HoYoverse rechaza canjes seguidos con menos de ~5 s (`-2016`). */
  betweenRedeemsMs: { min: 6_500, max: 9_000 },
  networkRetryMs: { min: 5_000, max: 10_000 },
  timeoutMs: 15_000,
  /** Intentos de un código en `retry` antes de darlo por fallido. */
  maxRedeemAttempts: 5,
} as const;

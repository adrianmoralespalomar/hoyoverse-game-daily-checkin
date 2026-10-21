/** Cada cuánto se recarga el panel: más rápido mientras el NAS está haciendo check-in o canjeando. */
export const DASHBOARD_REFRESH_INTERVALS_MS = {
  idle: 60_000,
  busy: 3_000,
} as const;

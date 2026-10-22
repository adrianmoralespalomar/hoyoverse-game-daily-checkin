/** El juego solo guarda unos 6 meses de historial (se da por igual en los tres): lo no importado a tiempo se pierde. */
export const WISH_IMPORT_EXPIRY = {
  retentionDays: 180,
  /** Días antes de la caducidad desde los que se avisa. */
  warningLeadDays: 14,
} as const;

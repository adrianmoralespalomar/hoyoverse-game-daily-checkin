/** Datos fijos del calendario de los juegos de HoYoverse. */
export const GAME_CALENDAR = {
  /** Las versiones duran 6 semanas en los tres juegos. */
  versionLengthMs: 42 * 24 * 3_600_000,
  /** Por debajo de esto, el calendario solo enseña media versión. */
  minFullVersionMs: 35 * 24 * 3_600_000,
  /** Hora del servidor de Europa: UTC+1, sin horario de verano. */
  euServerUtcOffsetMs: 3_600_000,
  /** Lo que cuesta una tirada en protogemas, jade estelar o películas. */
  currencyPerPull: 160,
} as const;

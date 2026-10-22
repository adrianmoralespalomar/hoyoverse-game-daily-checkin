/**
 * Cuándo se hace cada cosa (hora de Madrid, `TZ` del contenedor). La hora del check-in se cambia desde el panel.
 * Cualquier hora vale: el día de HoYoLAB cambia a medianoche UTC+8 (18:00 en verano, 17:00 en invierno) y el
 * check-in cuenta para el día que esté en curso.
 */
export const SCHEDULE = {
  defaultCheckInTime: '19:00',
  /** Cada hora: reintenta el check-in si falló por la red y busca códigos nuevos. */
  hourlyCron: '17 * * * *',
  /** Resina y energía: solo lectura, cada 20 minutos (entre medias, el panel estima la recarga). */
  notesCron: '*/20 * * * *',
  /** Calendario, contenido final y diario: solo lectura, cada 2 horas (cambian poco). */
  progressCron: '41 */2 * * *',
  /** Hojas de la comunidad con las tiradas F2P: cambian como mucho al empezar una versión. */
  f2pSheetsCron: '23 5 * * *',
  /** Reintentos del check-in en un mismo día de HoYoLAB, solo ante errores de red. */
  maxCheckInAttemptsPerDay: 3,
  /** Al arrancar, espera antes de ponerse al día (el NAS puede estar aún levantando la red). */
  startupDelayMs: 60_000,
  defaultStartJitterSeconds: 300,
} as const;

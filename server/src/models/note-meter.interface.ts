/** Un contador de las notas en tiempo real: resina, misiones diarias, jefes semanales... */
export interface NoteMeter {
  label: string;
  current: number;
  max: number;
  /** Cuándo llega al máximo solo (resina, moneda del reino). Sin él, no se recarga con el tiempo. */
  fullAt?: string | null;
}

/** Envoltorio de todas las respuestas de HoYoLAB y HoYoverse. */
export interface HoyoverseResponse<T> {
  retcode?: number;
  message?: string;
  data?: T | null;
}

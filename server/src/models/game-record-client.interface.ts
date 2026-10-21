/** Consultas de solo lectura a la Crónica de batalla de un juego, con su UID y servidor ya puestos. */
export interface GameRecordClient {
  /** `idStyle: 'uid'` manda `uid` y `region` en vez de `role_id` y `server` (lo piden algunos endpoints de ZZZ). */
  get<T>(endpoint: string, params?: Record<string, string>, idStyle?: 'role' | 'uid'): Promise<T>;
  /** POST con `role_id` y `server` en el cuerpo. */
  post<T>(endpoint: string): Promise<T>;
}

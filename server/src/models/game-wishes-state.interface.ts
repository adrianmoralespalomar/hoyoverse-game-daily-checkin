import type { WishRecord } from './wish-record.interface.ts';

/** Lo que se guarda en `data/wishes.json` por juego. El enlace no: solo vive en memoria. */
export interface GameWishesState {
  /** De la más antigua a la más nueva. */
  records: WishRecord[];
  updatedAt?: string;
  /** Versión del juego cuando se leyó por última vez (no está si la versión aún no se conocía). */
  updatedVersion?: string;
  error?: string;
  errorAt?: string;
}

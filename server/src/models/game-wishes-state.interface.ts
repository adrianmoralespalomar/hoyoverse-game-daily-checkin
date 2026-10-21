import type { WishRecord } from './wish-record.interface.ts';

/** Lo que se guarda en `data/wishes.json` por juego. El enlace no: solo vive en memoria. */
export interface GameWishesState {
  /** De la más antigua a la más nueva. */
  records: WishRecord[];
  updatedAt?: string;
  error?: string;
  errorAt?: string;
}

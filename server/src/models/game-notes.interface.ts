import type { NoteMeter } from './note-meter.interface.ts';

/** Notas en tiempo real de un juego, ya traducidas a un formato común. Espejo en `web/src/app/models`. */
export interface GameNotes {
  fetchedAt: string;
  /** La energía principal: resina original, poder trazacaminos o batería. */
  stamina: NoteMeter & {
    fullAt: string | null;
    /** Segundos que tarda en recuperarse 1 punto: el panel la va estimando entre consultas. */
    regenSeconds: number;
  };
  /** Diarias, semanales y otros contadores. */
  meters: NoteMeter[];
  expeditions: { ready: number; total: number; allReadyAt: string | null } | null;
}

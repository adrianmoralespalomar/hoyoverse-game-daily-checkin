import type { NoteMeter } from './note-meter.interface';

/** Espejo de `server/src/models/game-notes.interface.ts`. */
export interface GameNotes {
  fetchedAt: string;
  stamina: NoteMeter & { fullAt: string | null; regenSeconds: number };
  meters: NoteMeter[];
  expeditions: { ready: number; total: number; allReadyAt: string | null } | null;
}

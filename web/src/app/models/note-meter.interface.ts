/** Espejo de `server/src/models/note-meter.interface.ts`. */
export interface NoteMeter {
  label: string;
  current: number;
  max: number;
  fullAt?: string | null;
}

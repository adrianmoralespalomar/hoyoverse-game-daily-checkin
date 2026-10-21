/** Espejo de `server/src/models/game-version.interface.ts`. */
export interface GameVersion {
  name: string;
  startsAt: string;
  endsAt: string;
  estimatedEdge: 'start' | 'end' | null;
}

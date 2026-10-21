import type { GameNotes } from './game-notes.interface.ts';

export interface GameNotesState {
  /** Las últimas que se consiguieron, aunque la consulta siguiente fallara. */
  notes?: GameNotes;
  error?: string;
  errorAt?: string;
}

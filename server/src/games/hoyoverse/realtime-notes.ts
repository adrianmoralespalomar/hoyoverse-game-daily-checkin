import type { GameNotes } from '../../models/game-notes.interface.ts';
import type { HoyoverseGameConfig } from '../../models/hoyoverse-game-config.interface.ts';
import { NOTES_RETCODE_MESSAGES } from '../../models/notes-retcode-messages.const.ts';
import type { RealtimeNotesRequest } from '../../models/realtime-notes-request.interface.ts';
import { requestHoyolabData } from './hoyolab-data-request.ts';
import { REALTIME_NOTES_PARSERS } from './realtime-notes-parsers.ts';

/**
 * Notas en tiempo real de la Crónica de batalla (resina, energía, diarias...). Usa la cookie de HoYoLAB del
 * check-in y la firma DS. Lanza con un mensaje entendible si HoYoLAB no las da.
 */
export async function fetchRealtimeNotes(game: HoyoverseGameConfig, request: RealtimeNotesRequest): Promise<GameNotes> {
  const url = new URL(game.notesUrl);
  url.searchParams.set('server', game.region);
  url.searchParams.set('role_id', request.uid);
  const data = await requestHoyolabData<unknown>(url, { ...request, retcodeMessages: NOTES_RETCODE_MESSAGES });
  return REALTIME_NOTES_PARSERS[game.id](data, Date.now());
}

import { generateDynamicSecret } from '../../core/dynamic-secret.ts';
import { BROWSER_USER_AGENT } from '../../models/browser-user-agent.const.ts';
import { DYNAMIC_SECRET } from '../../models/dynamic-secret.const.ts';
import type { GameNotes } from '../../models/game-notes.interface.ts';
import type { HoyoverseGameConfig } from '../../models/hoyoverse-game-config.interface.ts';
import type { HoyoverseResponse } from '../../models/hoyoverse-response.interface.ts';
import { NOTES_RETCODE_MESSAGES } from '../../models/notes-retcode-messages.const.ts';
import type { RealtimeNotesRequest } from '../../models/realtime-notes-request.interface.ts';
import { REQUEST_PACING } from '../../models/request-pacing.const.ts';
import { REALTIME_NOTES_PARSERS } from './realtime-notes-parsers.ts';

/**
 * Notas en tiempo real de la Crónica de batalla (resina, energía, diarias...). Usa la cookie de HoYoLAB del
 * check-in y la firma DS. Lanza con un mensaje entendible si HoYoLAB no las da.
 */
export async function fetchRealtimeNotes(game: HoyoverseGameConfig, request: RealtimeNotesRequest): Promise<GameNotes> {
  const { cookie, language, uid, fetchImpl = fetch } = request;
  const url = new URL(game.notesUrl);
  url.searchParams.set('server', game.region);
  url.searchParams.set('role_id', uid);
  const response = await fetchImpl(url, {
    headers: {
      Accept: 'application/json, text/plain, */*',
      Origin: 'https://act.hoyolab.com',
      Referer: 'https://act.hoyolab.com/',
      'User-Agent': BROWSER_USER_AGENT,
      'x-rpc-app_version': DYNAMIC_SECRET.appVersion,
      'x-rpc-client_type': DYNAMIC_SECRET.clientType,
      'x-rpc-language': language,
      'x-rpc-lang': language,
      ds: generateDynamicSecret(),
      Cookie: cookie,
    },
    signal: AbortSignal.timeout(REQUEST_PACING.timeoutMs),
  });
  const json = await response.json().catch(() => null) as HoyoverseResponse<unknown> | null;
  if (!json) throw new Error(`Respuesta inesperada (HTTP ${response.status})`);
  if (json.retcode !== 0 || !json.data) {
    throw new Error(NOTES_RETCODE_MESSAGES[json.retcode ?? NaN] ?? `HoYoLAB respondió ${json.retcode}: ${json.message ?? 'sin mensaje'}`);
  }
  return REALTIME_NOTES_PARSERS[game.id](json.data, Date.now());
}

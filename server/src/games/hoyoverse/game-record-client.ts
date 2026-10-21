import type { GameRecordClient } from '../../models/game-record-client.interface.ts';
import type { HoyoverseGameConfig } from '../../models/hoyoverse-game-config.interface.ts';
import { NOTES_RETCODE_MESSAGES } from '../../models/notes-retcode-messages.const.ts';
import type { RealtimeNotesRequest } from '../../models/realtime-notes-request.interface.ts';
import { requestHoyolabData } from './hoyolab-data-request.ts';

export function createGameRecordClient(game: HoyoverseGameConfig, request: RealtimeNotesRequest): GameRecordClient {
  const { uid } = request;
  const options = { ...request, retcodeMessages: NOTES_RETCODE_MESSAGES };
  return {
    get: (endpoint, params = {}, idStyle = 'role') => {
      const url = new URL(`${game.recordApiUrl}/${endpoint}`);
      const ids = idStyle === 'role' ? { server: game.region, role_id: uid } : { uid, region: game.region };
      Object.entries({ ...ids, ...params }).forEach(([key, value]) => url.searchParams.set(key, value));
      return requestHoyolabData(url, options);
    },
    post: endpoint => requestHoyolabData(new URL(`${game.recordApiUrl}/${endpoint}`), {
      ...options,
      method: 'POST',
      body: { role_id: uid, server: game.region },
    }),
  };
}

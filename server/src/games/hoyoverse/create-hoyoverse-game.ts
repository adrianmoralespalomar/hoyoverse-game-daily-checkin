import type { GameModule } from '../../models/game-module.interface.ts';
import type { HoyoverseGameConfig } from '../../models/hoyoverse-game-config.interface.ts';
import type { HoyoverseGameSettings } from '../../models/hoyoverse-game-settings.interface.ts';
import { fetchAvailableCodes } from './hoyo-codes-client.ts';
import { checkIn, fetchCheckInSummary } from './hoyolab-check-in.ts';
import { redeemCode } from './hoyoverse-redeem.ts';
import { fetchRealtimeNotes } from './realtime-notes.ts';

export function createHoyoverseGame(game: HoyoverseGameConfig, settings: HoyoverseGameSettings): GameModule {
  const { checkInCookie, redeemCookie, checkInLanguage, uid, deviceUuid } = settings;
  const checkInOptions = { cookie: checkInCookie ?? '', language: checkInLanguage };
  const gameModule: GameModule = {
    id: game.id,
    name: game.name,
    fetchAvailableCodes: () => fetchAvailableCodes(game.codesApiGame),
  };
  if (checkInCookie) {
    gameModule.checkIn = () => checkIn(game, checkInOptions);
    gameModule.fetchCheckInSummary = () => fetchCheckInSummary(game, checkInOptions);
  }
  if (redeemCookie && uid) gameModule.redeemCode = code => redeemCode(game, { code, uid, cookie: redeemCookie, deviceUuid });
  else gameModule.redeemDisabledReason = !redeemCookie ? 'Falta la cookie de canje en el .env' : `Falta ${game.uidEnvVariable} en el .env`;
  if (checkInCookie && uid) gameModule.fetchNotes = () => fetchRealtimeNotes(game, { ...checkInOptions, uid });
  else gameModule.notesDisabledReason = !checkInCookie ? 'Falta la cookie de HoYoLAB en el .env' : `Falta ${game.uidEnvVariable} en el .env`;
  return gameModule;
}

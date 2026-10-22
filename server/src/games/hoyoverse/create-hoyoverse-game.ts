import type { GameModule } from '../../models/game-module.interface.ts';
import type { HoyoverseGameConfig } from '../../models/hoyoverse-game-config.interface.ts';
import type { HoyoverseGameSettings } from '../../models/hoyoverse-game-settings.interface.ts';
import { WISH_NAMES_LANGUAGE } from '../../models/wish-names-language.const.ts';
import { STANDARD_CHARACTERS } from '../../models/standard-characters.const.ts';
import { fetchCharacterIcons } from './character-icons.ts';
import { fetchNewWishes, isGachaLinkOfGame } from './gacha-log.ts';
import { createGameRecordClient } from './game-record-client.ts';
import { fetchAvailableCodes } from './hoyo-codes-client.ts';
import { checkIn, fetchCheckInSummary } from './hoyolab-check-in.ts';
import { redeemCode } from './hoyoverse-redeem.ts';
import { fetchLedgerMonth } from './ledger.ts';
import { GAME_PROGRESS_FETCHERS } from './progress/game-progress-fetchers.ts';
import { fetchRealtimeNotes } from './realtime-notes.ts';

export function createHoyoverseGame(game: HoyoverseGameConfig, settings: HoyoverseGameSettings): GameModule {
  const { checkInCookie, redeemCookie, checkInLanguage, uid, deviceUuid } = settings;
  const checkInOptions = { cookie: checkInCookie ?? '', language: checkInLanguage };
  const gameModule: GameModule = {
    id: game.id,
    name: game.name,
    fetchAvailableCodes: () => fetchAvailableCodes(game.codesApiGame),
    wishHistory: {
      matchesLink: link => isGachaLinkOfGame(game, link),
      fetchNewWishes: (authkey, knownIds) => fetchNewWishes(game, authkey, knownIds),
      topRank: game.gachaLog.topRank,
      standardCharacters: STANDARD_CHARACTERS[game.id],
      bannerKinds: game.gachaLog.banners.map(banner => banner.kind),
    },
  };
  if (checkInCookie) {
    gameModule.checkIn = () => checkIn(game, checkInOptions);
    gameModule.fetchCheckInSummary = () => fetchCheckInSummary(game, checkInOptions);
  }
  if (redeemCookie && uid) gameModule.redeemCode = code => redeemCode(game, { code, uid, cookie: redeemCookie, deviceUuid });
  else gameModule.redeemDisabledReason = !redeemCookie ? 'Falta la cookie de canje en el .env' : `Falta ${game.uidEnvVariable} en el .env`;
  if (checkInCookie && uid) {
    const recordClient = createGameRecordClient(game, { ...checkInOptions, uid });
    gameModule.fetchNotes = () => fetchRealtimeNotes(game, { ...checkInOptions, uid });
    gameModule.fetchCharacterIcons = () => fetchCharacterIcons(game.id, createGameRecordClient(game, { cookie: checkInCookie, language: WISH_NAMES_LANGUAGE, uid }));
    gameModule.fetchProgress = () => GAME_PROGRESS_FETCHERS[game.id](recordClient, game.currencyItemId, Date.now());
  } else gameModule.notesDisabledReason = !checkInCookie ? 'Falta la cookie de HoYoLAB en el .env' : `Falta ${game.uidEnvVariable} en el .env`;
  if (checkInCookie && redeemCookie && uid) {
    const ledgerOptions = { cookie: `${checkInCookie}; ${redeemCookie}`, language: checkInLanguage, uid };
    gameModule.fetchIncomeMonth = month => fetchLedgerMonth(game, ledgerOptions, month);
  } else gameModule.incomeDisabledReason = gameModule.notesDisabledReason ?? 'El diario necesita también la cookie de canje en el .env';
  return gameModule;
}

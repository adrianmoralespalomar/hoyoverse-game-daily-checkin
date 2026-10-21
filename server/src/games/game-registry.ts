import { readOrCreateDeviceUuid } from '../core/device-uuid.ts';
import type { AppSettings } from '../models/app-settings.interface.ts';
import type { GameModule } from '../models/game-module.interface.ts';
import { HOYOVERSE_GAMES } from '../models/hoyoverse-games.const.ts';
import { createHoyoverseGame } from './hoyoverse/create-hoyoverse-game.ts';

/** Los juegos activos, en el orden de `HOYOVERSE_GAMES`. Un juego que no sea de HoYoverse se añadiría aquí. */
export function createGameModules(settings: AppSettings, env: NodeJS.ProcessEnv = process.env): GameModule[] {
  const deviceUuid = readOrCreateDeviceUuid();
  return HOYOVERSE_GAMES
    .filter(game => settings.gameIds.includes(game.id))
    .map(game => createHoyoverseGame(game, { ...settings, uid: env[game.uidEnvVariable]?.trim() || null, deviceUuid }));
}

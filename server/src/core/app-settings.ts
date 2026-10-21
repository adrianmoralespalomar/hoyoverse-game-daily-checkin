import type { AppSettings } from '../models/app-settings.interface.ts';
import { ENV_VARIABLES } from '../models/env-variables.const.ts';
import type { GameId } from '../models/game-id.type.ts';
import { HOYOVERSE_GAMES } from '../models/hoyoverse-games.const.ts';
import { SCHEDULE } from '../models/schedule.const.ts';

export function readAppSettings(env: NodeJS.ProcessEnv = process.env): AppSettings {
  const problems: string[] = [];
  const checkInCookie = readCookie(env[ENV_VARIABLES.checkInCookie], ['ltuid_v2', 'ltoken_v2'], ENV_VARIABLES.checkInCookie, problems);
  const redeemCookie = readCookie(env[ENV_VARIABLES.redeemCookie], ['account_id_v2', 'cookie_token_v2'], ENV_VARIABLES.redeemCookie, problems);
  const requestedGameIds = (env[ENV_VARIABLES.games] ?? 'gi hsr zzz').toLowerCase().split(/[\s,]+/).filter(Boolean);
  const knownGameIds = new Set<string>(HOYOVERSE_GAMES.map(game => game.id));
  const unknownGameIds = requestedGameIds.filter(gameId => !knownGameIds.has(gameId));
  if (unknownGameIds.length) problems.push(`Juegos no válidos en ${ENV_VARIABLES.games}: ${unknownGameIds.join(', ')} (usa gi, hsr, zzz)`);
  return {
    checkInCookie,
    redeemCookie,
    gameIds: requestedGameIds.filter(gameId => knownGameIds.has(gameId)) as GameId[],
    checkInLanguage: env[ENV_VARIABLES.checkInLanguage] || 'es-es',
    startJitterMs: Number(env[ENV_VARIABLES.startJitterSeconds] ?? SCHEDULE.defaultStartJitterSeconds) * 1000,
    problems,
  };
}

/** `null` si falta o no trae las claves necesarias (y lo apunta en `problems`). */
function readCookie(value: string | undefined, requiredKeys: string[], variableName: string, problems: string[]): string | null {
  const cookie = value?.trim();
  if (!cookie) return null;
  const missingKeys = requiredKeys.filter(key => !new RegExp(`(^|;\\s*)${key}=`).test(cookie));
  if (!missingKeys.length) return cookie;
  problems.push(`A ${variableName} le falta ${missingKeys.join(' y ')} (formato: "${requiredKeys.map(key => `${key}=...`).join('; ')}")`);
  return null;
}

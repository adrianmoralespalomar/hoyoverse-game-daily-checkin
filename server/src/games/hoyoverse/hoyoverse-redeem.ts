import { BROWSER_USER_AGENT } from '../../models/browser-user-agent.const.ts';
import type { HoyoverseGameConfig } from '../../models/hoyoverse-game-config.interface.ts';
import type { HoyoverseResponse } from '../../models/hoyoverse-response.interface.ts';
import type { RedeemRequest } from '../../models/redeem-request.interface.ts';
import { REDEEM_RETCODES } from '../../models/redeem-retcodes.const.ts';
import type { RedeemResult } from '../../models/redeem-result.interface.ts';
import { REQUEST_PACING } from '../../models/request-pacing.const.ts';

/**
 * Canjea un código igual que la web oficial del juego (sus peticiones se copiaron del navegador). Nunca lanza.
 * No reintenta: un fallo de red queda en `retry` para la siguiente ronda.
 */
export async function redeemCode(game: HoyoverseGameConfig, request: RedeemRequest): Promise<RedeemResult> {
  const { fetchImpl = fetch } = request;
  try {
    const response = await fetchImpl(...buildRedeemRequest(game, request));
    // Verificación antibots (Aigis): no se intenta saltar, se deja para canjear a mano
    if (response.headers.get('x-rpc-aigis')) return { status: 'manual', message: 'HoYoverse pide verificación: canjéalo a mano en la web' };
    const json = await response.json().catch(() => null) as HoyoverseResponse<unknown> | null;
    if (!json) return { status: 'retry', message: `Respuesta inesperada (HTTP ${response.status})` };
    return interpretRedeemResponse(json);
  } catch (error) {
    return { status: 'retry', message: `Fallo de red: ${(error as Error).message}` };
  }
}

/** Genshin manda todo por la URL y sin cuerpo; HSR y ZZZ, un JSON con la hora en milisegundos. */
function buildRedeemRequest(game: HoyoverseGameConfig, { code, uid, cookie, deviceUuid }: RedeemRequest): [URL, RequestInit] {
  const { redeem } = game;
  const url = new URL(redeem.url);
  const headers: Record<string, string> = {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'es-ES,es;q=0.9,en;q=0.8',
    origin: redeem.siteOrigin,
    referer: `${redeem.siteOrigin}/`,
    'user-agent': BROWSER_USER_AGENT,
    cookie,
  };
  const init: RequestInit = { method: redeem.method, headers, signal: AbortSignal.timeout(REQUEST_PACING.timeoutMs) };
  if (redeem.method === 'GET') {
    const query = { uid, region: game.region, lang: 'es', cdkey: code, game_biz: redeem.gameBiz, sLangKey: 'es-es' };
    Object.entries(query).forEach(([name, value]) => url.searchParams.set(name, value));
    return [url, init];
  }
  headers['content-type'] = 'application/json;';
  const body = { t: Date.now(), lang: 'es', game_biz: redeem.gameBiz, uid, region: game.region, cdkey: code, platform: '4', device_uuid: deviceUuid };
  return [url, { ...init, body: JSON.stringify(body) }];
}

export function interpretRedeemResponse(json: HoyoverseResponse<unknown>): RedeemResult {
  const status = REDEEM_RETCODES[json.retcode ?? NaN] ?? 'failed';
  return { status, message: json.message || 'sin mensaje', retcode: json.retcode };
}

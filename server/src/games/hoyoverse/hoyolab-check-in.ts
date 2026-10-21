import { waitRandomly } from '../../core/pacing.ts';
import { BROWSER_USER_AGENT } from '../../models/browser-user-agent.const.ts';
import type { CheckInHomeData } from '../../models/check-in-home-data.interface.ts';
import type { CheckInInfoData } from '../../models/check-in-info-data.interface.ts';
import type { CheckInResult } from '../../models/check-in-result.interface.ts';
import { CHECK_IN_RETCODES } from '../../models/check-in-retcodes.const.ts';
import type { CheckInSignData } from '../../models/check-in-sign-data.interface.ts';
import type { CheckInSummary } from '../../models/check-in-summary.interface.ts';
import type { HoyoverseGameConfig } from '../../models/hoyoverse-game-config.interface.ts';
import type { HoyoverseRequestOptions } from '../../models/hoyoverse-request-options.interface.ts';
import type { HoyoverseResponse } from '../../models/hoyoverse-response.interface.ts';
import { REQUEST_PACING } from '../../models/request-pacing.const.ts';

/**
 * Hace lo mismo que pulsar la casilla del día en la web: un POST con tu cookie. Nunca lanza.
 * Un único reintento solo ante fallo de red, nunca ante una respuesta de HoYoLAB.
 */
export async function checkIn(game: HoyoverseGameConfig, options: HoyoverseRequestOptions): Promise<CheckInResult> {
  const { cookie, language, fetchImpl = fetch } = options;
  const url = buildCheckInUrl(game.checkIn.signUrl, game, language);
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: { ...buildHoyolabHeaders(game, cookie, language), 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({ act_id: game.checkIn.actId, lang: language }),
        signal: AbortSignal.timeout(REQUEST_PACING.timeoutMs),
      });
      const json = await response.json().catch(() => null) as HoyoverseResponse<CheckInSignData> | null;
      // Respuesta no-JSON (página de error, bloqueo, mantenimiento...): no se reintenta
      if (!json) return { status: 'error', message: `Respuesta inesperada (HTTP ${response.status})` };
      return interpretCheckInResponse(json);
    } catch (error) {
      if (attempt === 2) return { status: 'error', message: `Fallo de red: ${(error as Error).message}` };
      await waitRandomly(REQUEST_PACING.networkRetryMs);
    }
  }
  return { status: 'error', message: 'Sin respuesta' };
}

function buildCheckInUrl(baseUrl: string, game: HoyoverseGameConfig, language: string): URL {
  const url = new URL(baseUrl);
  url.searchParams.set('lang', language);
  url.searchParams.set('act_id', game.checkIn.actId);
  return url;
}

function buildHoyolabHeaders(game: HoyoverseGameConfig, cookie: string, language: string): Record<string, string> {
  return {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': `${language},es;q=0.9,en;q=0.8`,
    Origin: 'https://act.hoyolab.com',
    Referer: 'https://act.hoyolab.com/',
    'User-Agent': BROWSER_USER_AGENT,
    // Necesaria para ZZZ, inocua para el resto
    'x-rpc-signgame': game.id,
    Cookie: cookie,
  };
}

export function interpretCheckInResponse(json: HoyoverseResponse<CheckInSignData>): CheckInResult {
  // Captcha: HoYoLAB responde retcode 0 pero marca el intento como "de riesgo" y no da la recompensa
  const risk = json.data?.gt_result;
  if (risk && (risk.is_risk === true || (risk.risk_code && risk.risk_code !== 0))) {
    return { status: 'captcha', message: 'HoYoLAB pide captcha: haz el check-in a mano hoy', retcode: json.retcode };
  }
  const status = CHECK_IN_RETCODES[json.retcode ?? NaN] ?? 'error';
  return { status, message: json.message ?? 'sin mensaje', retcode: json.retcode };
}

/** Cuántos días llevas este mes y qué da cada día. Lanza si HoYoLAB no responde bien (el panel lo enseña sin él). */
export async function fetchCheckInSummary(game: HoyoverseGameConfig, options: HoyoverseRequestOptions): Promise<CheckInSummary> {
  const { cookie, language, fetchImpl = fetch } = options;
  const [info, home] = await Promise.all([
    fetchHoyolabData<CheckInInfoData>(fetchImpl, buildCheckInUrl(game.checkIn.infoUrl, game, language), buildHoyolabHeaders(game, cookie, language)),
    fetchHoyolabData<CheckInHomeData>(fetchImpl, buildCheckInUrl(game.checkIn.homeUrl, game, language), buildHoyolabHeaders(game, cookie, language)),
  ]);
  return {
    totalSignDays: info.total_sign_day ?? 0,
    isSignedToday: info.is_sign ?? false,
    monthRewards: (home.awards ?? []).map(award => ({ name: award.name ?? '', iconUrl: award.icon ?? '', count: award.cnt ?? 0 })),
  };
}

async function fetchHoyolabData<T>(fetchImpl: typeof fetch, url: URL, headers: Record<string, string>): Promise<T> {
  const response = await fetchImpl(url, { headers, signal: AbortSignal.timeout(REQUEST_PACING.timeoutMs) });
  const json = await response.json() as HoyoverseResponse<T>;
  if (json.retcode !== 0 || !json.data) throw new Error(`HoYoLAB respondió ${json.retcode}: ${json.message ?? 'sin mensaje'}`);
  return json.data;
}

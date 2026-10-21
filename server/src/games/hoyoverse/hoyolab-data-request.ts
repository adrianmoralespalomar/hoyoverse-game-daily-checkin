import { generateDynamicSecret } from '../../core/dynamic-secret.ts';
import { BROWSER_USER_AGENT } from '../../models/browser-user-agent.const.ts';
import { DYNAMIC_SECRET } from '../../models/dynamic-secret.const.ts';
import type { HoyolabDataRequest } from '../../models/hoyolab-data-request.interface.ts';
import type { HoyoverseResponse } from '../../models/hoyoverse-response.interface.ts';
import { REQUEST_PACING } from '../../models/request-pacing.const.ts';

/**
 * Consulta de solo lectura a HoYoLAB (Crónica de batalla, calendario, diario...) con la firma DS, como la web.
 * Devuelve el `data` de la respuesta o lanza con un mensaje entendible.
 */
export async function requestHoyolabData<T>(url: URL, request: HoyolabDataRequest): Promise<T> {
  const { cookie, language, method = 'GET', body, retcodeMessages = {}, fetchImpl = fetch } = request;
  const response = await fetchImpl(url, {
    method,
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
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(REQUEST_PACING.timeoutMs),
  });
  const json = await response.json().catch(() => null) as HoyoverseResponse<T> | null;
  if (!json) throw new Error(`Respuesta inesperada (HTTP ${response.status})`);
  if (json.retcode !== 0 || !json.data) {
    throw new Error(retcodeMessages[json.retcode ?? NaN] ?? `HoYoLAB respondió ${json.retcode}: ${json.message ?? 'sin mensaje'}`);
  }
  return json.data;
}

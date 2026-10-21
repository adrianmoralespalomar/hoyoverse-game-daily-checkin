import type { AvailableCode } from '../../models/available-code.interface.ts';
import { CODES_API_URL } from '../../models/codes-api-url.const.ts';
import type { CodesApiResponse } from '../../models/codes-api-response.interface.ts';
import { REQUEST_PACING } from '../../models/request-pacing.const.ts';

/** Códigos que la API pública da por válidos para ese juego. Lanza si no responde. */
export async function fetchAvailableCodes(codesApiGame: string, fetchImpl: typeof fetch = fetch): Promise<AvailableCode[]> {
  const url = new URL(CODES_API_URL);
  url.searchParams.set('game', codesApiGame);
  const response = await fetchImpl(url, { signal: AbortSignal.timeout(REQUEST_PACING.timeoutMs) });
  if (!response.ok) throw new Error(`La API de códigos respondió HTTP ${response.status}`);
  const json = await response.json() as CodesApiResponse;
  return (json.codes ?? [])
    .filter(({ code, status }) => !!code?.trim() && (status ?? 'OK') === 'OK')
    .map(({ code, rewards }) => ({ code: code!.trim(), rewards: rewards ?? '' }));
}

// Tests sin red: las peticiones esperadas salen del tráfico real de cada web de canje
import assert from 'node:assert/strict';
import test from 'node:test';
import { interpretRedeemResponse, redeemCode } from '../src/games/hoyoverse/hoyoverse-redeem.ts';
import { HOYOVERSE_GAMES } from '../src/models/hoyoverse-games.const.ts';
import { createFakeFetch, type CapturedRequest } from './fake-fetch.ts';

const REQUEST = { code: 'ABC123', uid: '700000001', cookie: 'account_id_v2=1; cookie_token_v2=v2_x', deviceUuid: 'device-1' };
const findGame = (gameId: string) => HOYOVERSE_GAMES.find(game => game.id === gameId)!;

test('-2017 → ya canjeado (respuesta real)', () => {
  assert.equal(interpretRedeemResponse({ data: null, message: 'Redemption code has already been used', retcode: -2017 }).status, 'already_redeemed');
});

test('0 → canjeado; -2016 → reintentar; -1071 → cookie caducada; desconocido → fallido', () => {
  assert.equal(interpretRedeemResponse({ retcode: 0 }).status, 'redeemed');
  assert.equal(interpretRedeemResponse({ retcode: -2016 }).status, 'retry');
  assert.equal(interpretRedeemResponse({ retcode: -1071 }).status, 'bad_cookie');
  assert.equal(interpretRedeemResponse({ retcode: -9999 }).status, 'failed');
});

test('Genshin: GET con todo en la URL y sin cuerpo', async () => {
  const requests: CapturedRequest[] = [];
  await redeemCode(findGame('gi'), { ...REQUEST, fetchImpl: createFakeFetch({ retcode: 0 }, requests) });
  const url = new URL(requests[0].url);
  assert.equal(url.origin + url.pathname, 'https://public-operation-hk4e.hoyoverse.com/common/apicdkey/api/webExchangeCdkey');
  assert.equal(url.searchParams.get('cdkey'), 'ABC123');
  assert.equal(url.searchParams.get('region'), 'os_euro');
  assert.equal(url.searchParams.get('game_biz'), 'hk4e_global');
  assert.equal(requests[0].init.method, 'GET');
  assert.equal(requests[0].init.body, undefined);
});

test('ZZZ: POST JSON al endpoint Risk con región EU', async () => {
  const requests: CapturedRequest[] = [];
  await redeemCode(findGame('zzz'), { ...REQUEST, fetchImpl: createFakeFetch({ retcode: 0 }, requests) });
  const body = JSON.parse(String(requests[0].init.body));
  assert.equal(requests[0].url, 'https://public-operation-nap.hoyoverse.com/common/apicdkey/api/webExchangeCdkeyRisk');
  assert.equal(requests[0].init.method, 'POST');
  assert.deepEqual({ ...body, t: 0 }, {
    t: 0, lang: 'es', game_biz: 'nap_global', uid: '700000001', region: 'prod_gf_eu', cdkey: 'ABC123', platform: '4', device_uuid: 'device-1',
  });
  assert.equal((requests[0].init.headers as Record<string, string>).origin, 'https://zenless.hoyoverse.com');
});

test('Verificación antibots (Aigis) → canjear a mano', async () => {
  const fakeFetch = createFakeFetch({ retcode: -3101 }, [], { 'x-rpc-aigis': '{"session_id":"1"}' });
  assert.equal((await redeemCode(findGame('hsr'), { ...REQUEST, fetchImpl: fakeFetch })).status, 'manual');
});

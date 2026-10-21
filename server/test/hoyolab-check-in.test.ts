// Tests sin red: simulan las respuestas de HoYoLAB. Ejecuta: npm test --prefix server
import assert from 'node:assert/strict';
import test from 'node:test';
import { readAppSettings } from '../src/core/app-settings.ts';
import { checkIn, interpretCheckInResponse } from '../src/games/hoyoverse/hoyolab-check-in.ts';
import { HOYOVERSE_GAMES } from '../src/models/hoyoverse-games.const.ts';
import { createFakeFetch, type CapturedRequest } from './fake-fetch.ts';

const COOKIE = 'ltuid_v2=123; ltoken_v2=v2_abc';
const ZZZ = HOYOVERSE_GAMES.find(game => game.id === 'zzz')!;

test('retcode 0 → ok', () => {
  assert.equal(interpretCheckInResponse({ retcode: 0, message: 'OK', data: {} }).status, 'ok');
});

test('-5003 → ya hecho hoy', () => {
  assert.equal(interpretCheckInResponse({ retcode: -5003 }).status, 'already');
});

test('-100 → cookie inválida', () => {
  assert.equal(interpretCheckInResponse({ retcode: -100 }).status, 'bad_cookie');
});

test('-10002 → sin cuenta en ese juego', () => {
  assert.equal(interpretCheckInResponse({ retcode: -10002 }).status, 'no_account');
});

test('captcha aunque retcode sea 0', () => {
  assert.equal(interpretCheckInResponse({ retcode: 0, data: { gt_result: { is_risk: true, risk_code: 5001 } } }).status, 'captcha');
});

test('gt_result sin riesgo → ok', () => {
  assert.equal(interpretCheckInResponse({ retcode: 0, data: { gt_result: { is_risk: false, risk_code: 0 } } }).status, 'ok');
});

test('retcode desconocido → error', () => {
  assert.equal(interpretCheckInResponse({ retcode: -999 }).status, 'error');
});

test('ZZZ: endpoint, act_id y cabecera x-rpc-signgame correctos', async () => {
  const requests: CapturedRequest[] = [];
  await checkIn(ZZZ, { cookie: COOKIE, language: 'es-es', fetchImpl: createFakeFetch({ retcode: 0 }, requests) });
  const { url, init } = requests[0];
  const headers = init.headers as Record<string, string>;
  assert.match(url, /^https:\/\/sg-act-nap-api\.hoyolab\.com\/event\/luna\/zzz\/os\/sign\?/);
  assert.match(url, /act_id=e202406031448091/);
  assert.equal(init.method, 'POST');
  assert.equal(headers['x-rpc-signgame'], 'zzz');
  assert.equal(headers.Cookie, COOKIE);
  assert.deepEqual(JSON.parse(String(init.body)), { act_id: 'e202406031448091', lang: 'es-es' });
});

test('config: cookies con sus claves y juegos válidos', () => {
  assert.equal(readAppSettings({}).checkInCookie, null);
  assert.match(readAppSettings({ HOYOLAB_COOKIE: 'ltoken=abc' }).problems[0], /ltuid_v2/);
  assert.deepEqual(readAppSettings({ HOYOLAB_COOKIE: COOKIE }).gameIds, ['gi', 'hsr', 'zzz']);
  assert.match(readAppSettings({ HOYOLAB_COOKIE: COOKIE, GAMES: 'gi lol' }).problems[0], /lol/);
  assert.match(readAppSettings({ HOYOVERSE_REDEEM_COOKIE: 'account_id_v2=1' }).problems[0], /cookie_token_v2/);
});

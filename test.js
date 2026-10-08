// Tests sin red: simulan las respuestas de HoYoLAB.  Ejecuta: node --test
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkIn, interpretResponse, readConfig, STATUS } from './index.js';

const COOKIE = 'ltuid_v2=123; ltoken_v2=v2_abc';
const fakeFetch = (json, capture) => async (url, opts) => {
  if (capture) capture.push({ url: String(url), opts });
  return { json: async () => json };
};

test('retcode 0 → ok', () => {
  assert.equal(interpretResponse({ retcode: 0, message: 'OK', data: {} }).status, STATUS.OK);
});

test('-5003 → ya hecho hoy', () => {
  assert.equal(interpretResponse({ retcode: -5003 }).status, STATUS.ALREADY);
});

test('-100 → cookie inválida', () => {
  assert.equal(interpretResponse({ retcode: -100 }).status, STATUS.BAD_COOKIE);
});

test('-10002 → sin cuenta en ese juego', () => {
  assert.equal(interpretResponse({ retcode: -10002 }).status, STATUS.NO_ACCOUNT);
});

test('captcha aunque retcode sea 0', () => {
  const r = interpretResponse({ retcode: 0, data: { gt_result: { is_risk: true, risk_code: 5001 } } });
  assert.equal(r.status, STATUS.CAPTCHA);
});

test('gt_result sin riesgo → ok', () => {
  const r = interpretResponse({ retcode: 0, data: { gt_result: { is_risk: false, risk_code: 0 } } });
  assert.equal(r.status, STATUS.OK);
});

test('retcode desconocido → error', () => {
  assert.equal(interpretResponse({ retcode: -999 }).status, STATUS.ERROR);
});

test('ZZZ: endpoint, act_id y cabecera x-rpc-signgame correctos', async () => {
  const calls = [];
  await checkIn('zzz', COOKIE, { fetchImpl: fakeFetch({ retcode: 0 }, calls) });
  const { url, opts } = calls[0];
  assert.match(url, /^https:\/\/sg-act-nap-api\.hoyolab\.com\/event\/luna\/zzz\/os\/sign\?/);
  assert.match(url, /act_id=e202406031448091/);
  assert.equal(opts.method, 'POST');
  assert.equal(opts.headers['x-rpc-signgame'], 'zzz');
  assert.equal(opts.headers.Cookie, COOKIE);
  assert.deepEqual(JSON.parse(opts.body), { act_id: 'e202406031448091', lang: 'es-es' });
});

test('juego desconocido → error sin hacer petición', async () => {
  const calls = [];
  const r = await checkIn('hi3', COOKIE, { fetchImpl: fakeFetch({ retcode: 0 }, calls) });
  assert.equal(r.status, STATUS.ERROR);
  assert.equal(calls.length, 0);
});

test('config: cookie obligatoria y con ltoken_v2/ltuid_v2', () => {
  assert.throws(() => readConfig({}), /HOYOLAB_COOKIE/);
  assert.throws(() => readConfig({ HOYOLAB_COOKIE: 'ltoken=abc' }), /ltoken_v2/);
  assert.deepEqual(readConfig({ HOYOLAB_COOKIE: COOKIE }).games, ['gi', 'hsr', 'zzz']);
  assert.throws(() => readConfig({ HOYOLAB_COOKIE: COOKIE, GAMES: 'gi lol' }), /lol/);
});

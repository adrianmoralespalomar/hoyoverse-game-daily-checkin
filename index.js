#!/usr/bin/env node
/**
 * HoYoLAB daily check-in — Genshin Impact, Honkai: Star Rail, Zenless Zone Zero.
 *
 * Hace exactamente lo mismo que pulsar la casilla del día en la web:
 * un POST por juego, con tu propia cookie de sesión. Sin dependencias (Node >= 18).
 *
 * Uso:  node --env-file=.env index.js
 */

import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// ---------------------------------------------------------------------------
// Configuración de los juegos
// ---------------------------------------------------------------------------
export const GAMES = {
  gi: {
    name: 'Genshin Impact',
    url: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign',
    actId: 'e202102251931481',
  },
  hsr: {
    name: 'Honkai: Star Rail',
    url: 'https://sg-public-api.hoyolab.com/event/luna/os/sign',
    actId: 'e202303301540311',
  },
  zzz: {
    name: 'Zenless Zone Zero',
    url: 'https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/sign',
    actId: 'e202406031448091',
  },
};

// Estados posibles de cada intento
export const STATUS = {
  OK: 'ok',                 // check-in hecho ahora
  ALREADY: 'already',       // ya estaba hecho hoy
  CAPTCHA: 'captcha',       // HoYoLAB pide captcha → hazlo a mano hoy
  BAD_COOKIE: 'bad_cookie', // cookie caducada o inválida
  NO_ACCOUNT: 'no_account', // esa cuenta no tiene ese juego
  ERROR: 'error',           // cualquier otra cosa
};

const RETCODES = {
  0: STATUS.OK,
  [-5003]: STATUS.ALREADY,
  [-100]: STATUS.BAD_COOKIE,
  [-10002]: STATUS.NO_ACCOUNT,
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const randomBetween = (min, max) => Math.floor(min + Math.random() * (max - min));

// ---------------------------------------------------------------------------
// Log: consola + fichero opcional (LOG_FILE)
// ---------------------------------------------------------------------------
async function log(level, msg) {
  const line = `[${new Date().toISOString()}] ${level.padEnd(5)} ${msg}`;
  (level === 'ERROR' ? console.error : console.log)(line);
  if (process.env.LOG_FILE) {
    try {
      await mkdir(path.dirname(process.env.LOG_FILE), { recursive: true });
      await appendFile(process.env.LOG_FILE, line + '\n');
    } catch {
      /* el log a fichero es opcional, no debe tumbar el check-in */
    }
  }
}

const DEFAULT_LOG_RETENTION_DAYS = 7;
const MS_PER_DAY = 86_400_000;

/**
 * Borra del LOG_FILE las líneas con más de LOG_RETENTION_DAYS días (por defecto 7).
 * Las líneas sin fecha ISO al principio se conservan. Exportada para poder testearla.
 */
export async function pruneOldLogLines(file, retentionDays = DEFAULT_LOG_RETENTION_DAYS, now = Date.now()) {
  try {
    const cutoff = now - retentionDays * MS_PER_DAY;
    const lines = (await readFile(file, 'utf8')).split('\n');
    const kept = lines.filter((line) => {
      const timestamp = Date.parse(line.match(/^\[([^\]]+)\]/)?.[1]);
      return Number.isNaN(timestamp) || timestamp >= cutoff;
    });
    if (kept.length < lines.length) await writeFile(file, kept.join('\n'));
  } catch {
    /* sin fichero todavía o sin permisos: el log a fichero es opcional */
  }
}

// ---------------------------------------------------------------------------
// Lógica principal
// ---------------------------------------------------------------------------

/** Interpreta la respuesta JSON de HoYoLAB. Exportada para poder testearla. */
export function interpretResponse(json) {
  // Captcha: HoYoLAB responde retcode 0 pero marca el intento como "de riesgo"
  // y no concede la recompensa hasta resolver un Geetest en la web.
  const risk = json?.data?.gt_result;
  if (risk && (risk.is_risk === true || (risk.risk_code && risk.risk_code !== 0))) {
    return { status: STATUS.CAPTCHA, message: 'HoYoLAB pide captcha: haz el check-in a mano hoy' };
  }
  const status = RETCODES[json?.retcode] ?? STATUS.ERROR;
  return { status, message: json?.message ?? 'sin mensaje', retcode: json?.retcode };
}

/** Hace el check-in de un juego. Nunca lanza: devuelve siempre un resultado. */
export async function checkIn(gameKey, cookie, { lang = 'es-es', fetchImpl = fetch } = {}) {
  const game = GAMES[gameKey];
  if (!game) return { game: gameKey, status: STATUS.ERROR, message: `Juego desconocido: ${gameKey}` };

  const url = new URL(game.url);
  url.searchParams.set('lang', lang);
  url.searchParams.set('act_id', game.actId);

  const request = () =>
    fetchImpl(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': `${lang},es;q=0.9,en;q=0.8`,
        'Content-Type': 'application/json;charset=UTF-8',
        Origin: 'https://act.hoyolab.com',
        Referer: 'https://act.hoyolab.com/',
        'User-Agent': USER_AGENT,
        'x-rpc-signgame': gameKey, // necesario para ZZZ, inocuo para el resto
        Cookie: cookie,
      },
      body: JSON.stringify({ act_id: game.actId, lang }),
      signal: AbortSignal.timeout(15_000),
    });

  // Un único reintento solo ante fallo de red, nunca ante una respuesta de HoYoLAB.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await request();
      let json;
      try {
        json = await res.json();
      } catch {
        // Respuesta no-JSON (página de error, bloqueo, mantenimiento...): no reintentamos.
        return { game: gameKey, name: game.name, status: STATUS.ERROR, message: `Respuesta inesperada (HTTP ${res.status})` };
      }
      return { game: gameKey, name: game.name, ...interpretResponse(json) };
    } catch (err) {
      if (attempt === 2) {
        return { game: gameKey, name: game.name, status: STATUS.ERROR, message: `Fallo de red: ${err.message}` };
      }
      await sleep(randomBetween(5_000, 10_000));
    }
  }
}

/** Lee y valida la configuración del entorno. */
export function readConfig(env = process.env) {
  const cookie = (env.HOYOLAB_COOKIE ?? '').trim();
  if (!cookie) throw new Error('Falta HOYOLAB_COOKIE en el .env');
  if (!/ltoken_v2=/.test(cookie) || !/ltuid_v2=/.test(cookie)) {
    throw new Error('La cookie debe incluir ltoken_v2 y ltuid_v2 (formato: "ltuid_v2=...; ltoken_v2=...")');
  }
  const games = (env.GAMES ?? 'gi hsr zzz').toLowerCase().split(/[\s,]+/).filter(Boolean);
  const unknown = games.filter((g) => !GAMES[g]);
  if (unknown.length) throw new Error(`Juegos no válidos en GAMES: ${unknown.join(', ')} (usa gi, hsr, zzz)`);
  return {
    cookie,
    games,
    lang: env.HOYOLAB_LANG || 'es-es',
    startJitterMaxMs: Number(env.START_JITTER_SECONDS ?? 0) * 1000,
  };
}

/**
 * Punto de enganche para notificaciones (Telegram, Discord...).
 * De momento no hace nada; lo rellenamos más adelante.
 */
async function notify(_results) {}

export async function main() {
  if (process.env.LOG_FILE) {
    const retentionDays = Number(process.env.LOG_RETENTION_DAYS || DEFAULT_LOG_RETENTION_DAYS);
    await pruneOldLogLines(process.env.LOG_FILE, retentionDays);
  }

  let config;
  try {
    config = readConfig();
  } catch (err) {
    await log('ERROR', err.message);
    process.exitCode = 2;
    return;
  }

  if (config.startJitterMaxMs > 0) {
    const wait = randomBetween(0, config.startJitterMaxMs);
    await log('INFO', `Esperando ${Math.round(wait / 1000)} s antes de empezar`);
    await sleep(wait);
  }

  const results = [];
  for (const [i, gameKey] of config.games.entries()) {
    if (i > 0) await sleep(randomBetween(2_000, 6_000)); // ritmo humano entre juegos

    const r = await checkIn(gameKey, config.cookie, { lang: config.lang });
    results.push(r);

    const icon = { ok: '✅', already: '☑️', captcha: '🧩', bad_cookie: '🔑', no_account: '➖', error: '❌' }[r.status];
    await log(r.status === STATUS.ERROR ? 'ERROR' : 'INFO', `${icon} ${r.name}: ${r.status} — ${r.message}`);

    // Si la cookie no vale para uno, no vale para ninguno: paramos sin insistir.
    if (r.status === STATUS.BAD_COOKIE) {
      await log('ERROR', 'Cookie inválida o caducada. Cópiala de nuevo desde HoYoLAB y actualiza el .env');
      break;
    }
  }

  await notify(results);

  const needsAttention = results.some((r) =>
    [STATUS.CAPTCHA, STATUS.BAD_COOKIE, STATUS.ERROR].includes(r.status),
  );
  process.exitCode = needsAttention ? 1 : 0;
}

// Ejecutar solo si se llama directamente (no al importarlo en tests)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}

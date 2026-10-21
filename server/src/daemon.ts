import './core/load-env-file.ts';
import { existsSync, readFileSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { readAppSettings } from './core/app-settings.ts';
import { ExclusiveRunner } from './core/exclusive-runner.ts';
import { getHoyolabDayKey } from './core/hoyolab-day.ts';
import { log } from './core/log.ts';
import { createSessionCookie, hasAccess, isAuthRequired, isCorrectWebPassword } from './core/request-access.ts';
import { createGameModules } from './games/game-registry.ts';
import { AUTH_SESSION } from './models/auth-session.const.ts';
import { DAEMON_HOST, DAEMON_PORT } from './models/daemon-address.const.ts';
import type { Dashboard } from './models/dashboard.interface.ts';
import { DEPLOY_ID_FILE_PATH, WEB_BUILD_DIRECTORY } from './models/project-paths.const.ts';
import { PUBLIC_API_PATHS } from './models/public-api-paths.const.ts';
import { CheckInService } from './services/check-in-service.ts';
import { CodeRedemptionService } from './services/code-redemption-service.ts';
import { CookieStateStore } from './services/cookie-state-store.ts';
import { IncomeService } from './services/income-service.ts';
import { NotesService } from './services/notes-service.ts';
import { ProgressService } from './services/progress-service.ts';
import { TaskScheduler } from './services/task-scheduler.ts';
import { UserSettingsStore } from './services/user-settings-store.ts';
import { WishHistoryService } from './services/wish-history-service.ts';

const deployId = existsSync(DEPLOY_ID_FILE_PATH) ? readFileSync(DEPLOY_ID_FILE_PATH, 'utf8').trim() : 'local';
const settings = readAppSettings();
settings.problems.forEach(problem => log('ERROR', problem));
const games = createGameModules(settings);
const cookies = new CookieStateStore(settings);
const checkIn = new CheckInService(games, cookies, settings.startJitterMs);
const codes = new CodeRedemptionService(games, cookies);
const runner = new ExclusiveRunner();
const notes = new NotesService(games, cookies);
const progress = new ProgressService(games, cookies);
const income = new IncomeService(games, cookies);
const wishes = new WishHistoryService(games);
const userSettings = new UserSettingsStore();
const scheduler = new TaskScheduler(runner, checkIn, codes, notes, progress, income, wishes);
scheduler.start(userSettings.get().checkInTime);

const app = Fastify();

app.setErrorHandler((error, _request, reply) => {
  reply.code(400).send({ ok: false, error: error instanceof Error ? error.message : String(error) });
});

// Con WEB_PASSWORD en el .env, la API solo responde a los navegadores donde se puso la contraseña
app.addHook('onRequest', async (request, reply) => {
  const path = request.url.split('?')[0];
  if (!path.startsWith('/api/') || PUBLIC_API_PATHS.has(path) || hasAccess(request)) return;
  return reply.code(401).send({ ok: false, error: 'Hace falta la contraseña del panel' });
});

app.get('/api/auth/status', async request => ({ required: isAuthRequired(), authenticated: hasAccess(request) }));

app.post<{ Body: { password?: string } }>('/api/auth/login', async ({ body }, reply) => {
  if (isCorrectWebPassword(body?.password ?? '')) return reply.header('set-cookie', createSessionCookie()).send({ ok: true });
  await wait(AUTH_SESSION.failedLoginDelayMs);
  return reply.code(401).send({ ok: false, error: 'Contraseña incorrecta' });
});

app.get('/api/deploy-id', async () => ({ deployId }));

app.get('/api/dashboard', async (): Promise<Dashboard> => ({
  hoyolabDay: getHoyolabDayKey(),
  isBusy: runner.isBusy,
  checkInTimeLabel: userSettings.get().checkInTime,
  cookies: { checkIn: withoutFingerprint(cookies.get('checkIn')), redeem: withoutFingerprint(cookies.get('redeem')) },
  problems: settings.problems,
  games: games.map(game => {
    const version = progress.getVersion(game.id);
    return {
      id: game.id,
      name: game.name,
      checkIn: checkIn.getView(game),
      codes: codes.getView(game),
      notes: notes.getView(game),
      progress: progress.getView(game),
      income: income.getView(game, version, userSettings.getF2pPulls(game.id, version?.name)),
      wishes: wishes.getView(game, version),
    };
  }),
}));

// Las tareas pueden tardar (pausas entre juegos y entre canjes): se lanzan y el panel sigue `isBusy`
app.post('/api/check-in/run', async () => {
  runner.run(() => checkIn.run('manual')).catch((error: Error) => log('ERROR', `Check-in fallido: ${error.message}`));
  return { ok: true };
});

app.put<{ Body: { checkInTime?: unknown } }>('/api/settings/check-in-time', async ({ body }) => {
  const { checkInTime } = userSettings.saveCheckInTime(body?.checkInTime);
  scheduler.setCheckInTime(checkInTime);
  return { ok: true, checkInTime };
});

// Solo lee y tarda unos segundos: se espera, así el panel recarga ya con lo nuevo
app.post('/api/notes/refresh', async () => {
  await notes.refresh();
  return { ok: true };
});

app.put<{ Body: { gameId?: unknown; version?: unknown; pulls?: unknown } }>('/api/settings/f2p-pulls', async ({ body }) => {
  const game = games.find(({ id }) => id === body?.gameId);
  if (!game) throw new Error('Juego desconocido');
  userSettings.saveF2pPulls(game.id, body?.version, body?.pulls);
  return { ok: true };
});

// Calendario, contenido final y diario: unos segundos por juego, se espera igual que las notas
app.post('/api/progress/refresh', async () => {
  await scheduler.refreshProgressAndIncome();
  return { ok: true };
});

// El enlace va en el cuerpo (nunca en la URL ni en el log). La primera descarga tarda minutos: se lanza y el panel sigue `isImporting`
app.post<{ Body: { link?: unknown } }>('/api/wishes/import', async ({ body }) => {
  const game = wishes.saveLink(body?.link);
  runner.run(() => wishes.importWishes(game)).catch((error: Error) => log('ERROR', `Historial fallido: ${error.message}`));
  return { ok: true, gameId: game.id };
});

app.post('/api/codes/run', async () => {
  runner.run(() => codes.run()).catch((error: Error) => log('ERROR', `Canje fallido: ${error.message}`));
  return { ok: true };
});

if (existsSync(WEB_BUILD_DIRECTORY)) {
  await app.register(fastifyStatic, { root: WEB_BUILD_DIRECTORY });
  app.setNotFoundHandler(({ method, url }, reply) => {
    if (method !== 'GET' || url.startsWith('/api/')) return reply.code(404).send({ ok: false, error: `No existe ${method} ${url}` });
    return reply.sendFile('index.html');
  });
}

await app.listen({ host: DAEMON_HOST, port: DAEMON_PORT });
log('INFO', `Hoyo Games en marcha: http://${DAEMON_HOST}:${DAEMON_PORT} (${games.map(game => game.id).join(', ')})`);

function withoutFingerprint({ fingerprint: _fingerprint, ...state }: ReturnType<CookieStateStore['get']>): Dashboard['cookies']['checkIn'] {
  return state;
}

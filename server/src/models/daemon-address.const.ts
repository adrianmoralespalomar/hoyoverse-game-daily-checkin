import { ENV_VARIABLES } from './env-variables.const.ts';

/** En el contenedor, `HOST=0.0.0.0` (lo pone el Dockerfile). En el PC, solo local. */
export const DAEMON_HOST = process.env[ENV_VARIABLES.host] ?? '127.0.0.1';
export const DAEMON_PORT = Number(process.env[ENV_VARIABLES.port] ?? 4330);

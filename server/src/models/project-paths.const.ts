import { resolve } from 'node:path';
import { ENV_VARIABLES } from './env-variables.const.ts';

const PROJECT_ROOT_DIRECTORY = resolve(import.meta.dirname, '../../..');

export const DATA_DIRECTORY = resolve(PROJECT_ROOT_DIRECTORY, process.env[ENV_VARIABLES.dataDirectory] ?? 'data');
export const ENV_FILE_PATH = resolve(PROJECT_ROOT_DIRECTORY, '.env');
export const WEB_BUILD_DIRECTORY = resolve(PROJECT_ROOT_DIRECTORY, 'web/dist/web/browser');
/** Lo escribe `npm run deploy`: el daemon lo lee al arrancar, así se sabe si ya corre el código recién desplegado. */
export const DEPLOY_ID_FILE_PATH = resolve(PROJECT_ROOT_DIRECTORY, 'server/src/deploy-id.txt');

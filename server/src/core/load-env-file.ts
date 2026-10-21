import { existsSync } from 'node:fs';
import { ENV_FILE_PATH } from '../models/project-paths.const.ts';

// Se importa lo primero en daemon.ts: así el .env ya está cargado cuando el resto de módulos leen process.env
if (existsSync(ENV_FILE_PATH)) process.loadEnvFile(ENV_FILE_PATH);

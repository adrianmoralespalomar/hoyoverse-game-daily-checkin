/** Qué copia `npm run deploy` al NAS. `data/` y `.env` nunca se tocan: viven solo en el NAS. */
export const NAS_DEPLOY = {
  /** Se puede cambiar con la variable NAS_DEPLOY_PATH. */
  defaultPath: '\\\\ChanoNAS\\Programas\\hoyo-games',
  daemonUrl: 'http://192.168.1.142:4330',
  /** Quedan iguales que en el PC: se sobrescriben los ficheros y se borran los que ya no existen. */
  mirroredDirectories: ['server/src', 'web/dist'],
  copiedFiles: ['Dockerfile', 'docker-compose.yaml', '.dockerignore', 'server/package.json', 'server/package-lock.json', 'README.md'],
  /** Si alguno cambia, el contenedor no se entera con un reinicio: hay que reconstruir el proyecto en UGOS. */
  filesRequiringRebuild: ['Dockerfile', 'docker-compose.yaml', 'server/package-lock.json'],
  /** Marca única de cada despliegue: el daemon la lee al arrancar y la devuelve en /api/deploy-id. */
  deployIdFile: 'server/src/deploy-id.txt',
  /** El daemon tarda unos segundos en reiniciarse (node --watch) tras la copia. */
  deployIdCheck: { attempts: 20, delayMs: 1000 },
} as const;

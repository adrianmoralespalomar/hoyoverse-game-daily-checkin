import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { NAS_DEPLOY } from './models/nas-deploy.const.ts';

/*
 * Publica en el NAS lo que hay en el PC: compila el panel y copia el código.
 * El contenedor lo detecta (node --watch) y se reinicia solo. Uso: `npm run deploy`.
 */

const projectDirectory = resolve(import.meta.dirname, '..');
const nasDirectory = process.env.NAS_DEPLOY_PATH ?? NAS_DEPLOY.defaultPath;
const REBUILD_INSTRUCTIONS = 'Reconstruye el proyecto "hoyo-games" en UGOS (Docker → Proyectos) para que lo use.';

if (!existsSync(nasDirectory)) {
  console.error(`No encuentro la carpeta del NAS: ${nasDirectory}. Créala (ver README) y comprueba que el NAS está encendido.`);
  process.exit(1);
}

// Se comprueba antes de copiar, comparando con lo que hay ahora en el NAS
const filesRequiringRebuild = NAS_DEPLOY.filesRequiringRebuild.filter(file => hasChanged(file));

console.log('Compilando el panel…');
execSync('npm run build --prefix web', { cwd: projectDirectory, stdio: 'inherit' });
const deployId = new Date().toISOString();
writeFileSync(resolve(projectDirectory, NAS_DEPLOY.deployIdFile), deployId);

for (const directory of NAS_DEPLOY.mirroredDirectories) {
  mirrorDirectory(resolve(projectDirectory, directory), resolve(nasDirectory, directory));
  console.log(`Copiado ${directory}`);
}
NAS_DEPLOY.copiedFiles.forEach(file => {
  mkdirSync(resolve(nasDirectory, file, '..'), { recursive: true });
  cpSync(resolve(projectDirectory, file), resolve(nasDirectory, file));
});
console.log(`Copiados ${NAS_DEPLOY.copiedFiles.length} ficheros de configuración`);

if (filesRequiringRebuild.length) console.warn(`\nHan cambiado ${filesRequiringRebuild.join(', ')}. ${REBUILD_INSTRUCTIONS}`);
else if (await isDeployRunningOnNas(deployId)) console.log('\nListo: el NAS ya usa el código nuevo. Recarga el panel para ver los cambios.');
else console.warn('\nEl código está copiado, pero el daemon del NAS no se ha reiniciado con él. Reinicia el proyecto "hoyo-games" en UGOS (Docker → Proyectos → ⋯ → Reiniciar).');

/**
 * Deja `targetDirectory` igual que `sourceDirectory`: sobrescribe los ficheros (sin borrarlos antes, para que
 * node --watch del contenedor detecte el cambio) y borra los que ya no existen en el PC.
 * Nunca borra la carpeta en sí: el contenedor la tiene montada y se quedaría enganchado a la vieja.
 */
function mirrorDirectory(sourceDirectory: string, targetDirectory: string): void {
  mkdirSync(targetDirectory, { recursive: true });
  removeEntriesMissingFrom(sourceDirectory, targetDirectory);
  cpSync(sourceDirectory, targetDirectory, { recursive: true, force: true });
}

function removeEntriesMissingFrom(sourceDirectory: string, targetDirectory: string): void {
  for (const entry of readdirSync(targetDirectory, { withFileTypes: true })) {
    const sourcePath = resolve(sourceDirectory, entry.name);
    const targetPath = resolve(targetDirectory, entry.name);
    if (!existsSync(sourcePath)) rmSync(targetPath, { recursive: true, force: true });
    else if (entry.isDirectory()) removeEntriesMissingFrom(sourcePath, targetPath);
  }
}

function hasChanged(file: string): boolean {
  const nasPath = resolve(nasDirectory, file);
  if (!existsSync(nasPath)) return true;
  return readFileSync(nasPath, 'utf8') !== readFileSync(resolve(projectDirectory, file), 'utf8');
}

/** El daemon lee la marca del despliegue al arrancar: si devuelve la de este, se ha reiniciado con el código nuevo. */
async function isDeployRunningOnNas(expectedDeployId: string): Promise<boolean> {
  for (let attempt = 0; attempt < NAS_DEPLOY.deployIdCheck.attempts; attempt++) {
    try {
      const response = await fetch(`${NAS_DEPLOY.daemonUrl}/api/deploy-id`);
      if (response.ok && (await response.json() as { deployId?: string }).deployId === expectedDeployId) return true;
    } catch {
      // Mientras el daemon se reinicia no responde: se vuelve a intentar
    }
    await wait(NAS_DEPLOY.deployIdCheck.delayMs);
  }
  return false;
}

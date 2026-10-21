import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DATA_DIRECTORY } from '../models/project-paths.const.ts';

export function readDataFile<T>(fileName: string, fallback: T): T {
  const filePath = resolve(DATA_DIRECTORY, fileName);
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

/** Escribe en un temporal y lo renombra: si el NAS se apaga a mitad, el fichero anterior sigue entero. */
export function writeDataFile(fileName: string, content: unknown): void {
  mkdirSync(DATA_DIRECTORY, { recursive: true });
  const filePath = resolve(DATA_DIRECTORY, fileName);
  writeFileSync(`${filePath}.tmp`, JSON.stringify(content, null, 2));
  renameSync(`${filePath}.tmp`, filePath);
}

import { createHash } from 'node:crypto';
import { readDataFile, writeDataFile } from '../core/data-file-store.ts';
import type { AppSettings } from '../models/app-settings.interface.ts';
import type { CookieKind } from '../models/cookie-kind.type.ts';
import type { CookieState } from '../models/cookie-state.interface.ts';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';

/** Recuerda si cada cookie funciona. Al cambiarla en el `.env` (y reiniciar), vuelve a `unknown` y se reintenta. */
export class CookieStateStore {
  #states: Partial<Record<CookieKind, CookieState>> = readDataFile(DATA_FILE_NAMES.cookies, {});
  #fingerprints: Record<CookieKind, string | null>;

  constructor(settings: AppSettings) {
    this.#fingerprints = { checkIn: toFingerprint(settings.checkInCookie), redeem: toFingerprint(settings.redeemCookie) };
  }

  get(kind: CookieKind): CookieState {
    const fingerprint = this.#fingerprints[kind];
    if (!fingerprint) return { health: 'missing' };
    const state = this.#states[kind];
    return state?.fingerprint === fingerprint ? state : { health: 'unknown' };
  }

  isUsable(kind: CookieKind): boolean {
    return !['missing', 'expired'].includes(this.get(kind).health);
  }

  report(kind: CookieKind, health: 'ok' | 'expired'): void {
    const fingerprint = this.#fingerprints[kind];
    if (!fingerprint) return;
    this.#states[kind] = { health, checkedAt: new Date().toISOString(), fingerprint };
    writeDataFile(DATA_FILE_NAMES.cookies, this.#states);
  }
}

/** Huella corta: sirve para saber si la cookie ha cambiado sin guardarla en `data/`. */
function toFingerprint(cookie: string | null): string | null {
  return cookie ? createHash('sha256').update(cookie).digest('hex').slice(0, 16) : null;
}

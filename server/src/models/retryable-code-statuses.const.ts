import type { CodeRecord } from './code-record.interface.ts';

/** Códigos que se vuelven a intentar en la siguiente ronda. `bad_cookie`, en cuanto haya una cookie nueva. */
export const RETRYABLE_CODE_STATUSES: ReadonlySet<CodeRecord['status']> = new Set(['pending', 'retry', 'bad_cookie']);

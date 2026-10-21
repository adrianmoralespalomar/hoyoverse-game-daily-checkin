import type { CheckInStatus } from './check-in-status.type.ts';

/** Resultados que no se arreglan reintentando el mismo día. Solo `error` (red, mantenimiento...) se reintenta. */
export const FINAL_CHECK_IN_STATUSES: ReadonlySet<CheckInStatus> = new Set(['ok', 'already', 'captcha', 'bad_cookie', 'no_account']);

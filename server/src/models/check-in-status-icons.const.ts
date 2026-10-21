import type { CheckInStatus } from './check-in-status.type.ts';

/** Para los registros del contenedor. */
export const CHECK_IN_STATUS_ICONS: Record<CheckInStatus, string> = {
  ok: '✅',
  already: '☑️',
  captcha: '🧩',
  bad_cookie: '🔑',
  no_account: '➖',
  error: '❌',
};

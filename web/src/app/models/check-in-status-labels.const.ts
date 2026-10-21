import type { CheckInStatus } from './check-in-status.type';

export const CHECK_IN_STATUS_LABELS: Record<CheckInStatus, string> = {
  ok: 'Hecho',
  already: 'Hecho',
  captcha: 'Pide captcha',
  bad_cookie: 'Cookie caducada',
  no_account: 'Sin cuenta',
  error: 'Ha fallado',
};

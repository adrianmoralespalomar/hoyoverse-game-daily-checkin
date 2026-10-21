import type { CheckInStatus } from './check-in-status.type.ts';

/** Códigos de respuesta de HoYoLAB al hacer check-in. Cualquier otro es `error`. */
export const CHECK_IN_RETCODES: Record<number, CheckInStatus> = {
  0: 'ok',
  [-5003]: 'already',
  [-100]: 'bad_cookie',
  [-10002]: 'no_account',
};

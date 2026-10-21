/**
 * - `ok`: check-in hecho ahora · `already`: ya estaba hecho hoy
 * - `captcha`: HoYoLAB pide captcha (hay que hacerlo a mano) · `bad_cookie`: cookie caducada o inválida
 * - `no_account`: esa cuenta no tiene ese juego · `error`: cualquier otra cosa
 */
export type CheckInStatus = 'ok' | 'already' | 'captcha' | 'bad_cookie' | 'no_account' | 'error';

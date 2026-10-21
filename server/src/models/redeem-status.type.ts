/**
 * - `redeemed`: canjeado ahora · `already_redeemed`: ya lo habías canjeado (o uno de su misma familia en ZZZ)
 * - `expired` / `invalid`: no vale (también los códigos de otra región)
 * - `manual`: HoYoverse pide verificación: hay que canjearlo a mano en la web
 * - `retry`: fallo de red o espera entre canjes: se reintenta en la próxima ronda
 * - `bad_cookie`: la cookie de canje ha caducado · `failed`: cualquier otro rechazo
 */
export type RedeemStatus = 'redeemed' | 'already_redeemed' | 'expired' | 'invalid' | 'manual' | 'retry' | 'bad_cookie' | 'failed';

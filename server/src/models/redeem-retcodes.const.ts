import type { RedeemStatus } from './redeem-status.type.ts';

/**
 * Códigos de respuesta de la web de canje. `-2017` está comprobado con tráfico real; el resto los usan los
 * proyectos de la comunidad. Cualquier otro es `failed` y se guarda el mensaje tal cual.
 */
export const REDEEM_RETCODES: Record<number, RedeemStatus> = {
  0: 'redeemed',
  [-2017]: 'already_redeemed',
  [-2018]: 'already_redeemed',
  [-2001]: 'expired',
  [-2003]: 'invalid',
  [-2004]: 'invalid',
  [-2016]: 'retry',
  [-1071]: 'bad_cookie',
  [-100]: 'bad_cookie',
};

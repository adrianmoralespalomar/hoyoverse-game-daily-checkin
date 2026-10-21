import type { RedeemStatus } from './redeem-status.type.ts';

/** Respuestas que solo se dan con la sesión iniciada: confirman que la cookie de canje funciona. */
export const COOKIE_ACCEPTED_REDEEM_STATUSES: ReadonlySet<RedeemStatus> = new Set(['redeemed', 'already_redeemed', 'expired', 'invalid']);

import type { RedeemStatus } from './redeem-status.type.ts';

/** Lo que se sabe de un código en tu cuenta. Se guarda para no intentar canjearlo dos veces. */
export interface CodeRecord {
  code: string;
  rewards: string;
  firstSeenAt: string;
  /** Sin intento todavía: `pending`. */
  status: RedeemStatus | 'pending';
  message?: string;
  attemptedAt?: string;
  attempts: number;
}

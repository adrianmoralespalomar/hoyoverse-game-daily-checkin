import type { RedeemStatus } from './redeem-status.type';

/** Espejo de `CodeRecord & { isActive }` del servidor. */
export interface CodeView {
  code: string;
  rewards: string;
  firstSeenAt: string;
  status: RedeemStatus | 'pending';
  message?: string;
  attemptedAt?: string;
  attempts: number;
  isActive: boolean;
}

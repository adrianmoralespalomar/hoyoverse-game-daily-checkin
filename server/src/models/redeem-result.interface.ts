import type { RedeemStatus } from './redeem-status.type.ts';

export interface RedeemResult {
  status: RedeemStatus;
  message: string;
  retcode?: number;
}

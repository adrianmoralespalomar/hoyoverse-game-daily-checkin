import type { CheckInStatus } from './check-in-status.type.ts';

export interface CheckInResult {
  status: CheckInStatus;
  message: string;
  retcode?: number;
}

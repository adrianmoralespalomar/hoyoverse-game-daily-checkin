import type { CodeRecord } from './code-record.interface.ts';

export interface GameCodesState {
  records: Record<string, CodeRecord>;
  /** Códigos que la fuente daba por válidos en la última consulta. */
  activeCodes: string[];
  lastFetchedAt?: string;
  fetchError?: string;
}

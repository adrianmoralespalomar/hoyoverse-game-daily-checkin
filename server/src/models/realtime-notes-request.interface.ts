import type { HoyoverseRequestOptions } from './hoyoverse-request-options.interface.ts';

export interface RealtimeNotesRequest extends HoyoverseRequestOptions {
  uid: string;
}

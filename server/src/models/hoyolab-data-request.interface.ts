import type { HoyoverseRequestOptions } from './hoyoverse-request-options.interface.ts';

export interface HoyolabDataRequest extends HoyoverseRequestOptions {
  method?: 'GET' | 'POST';
  body?: Record<string, string>;
  /** Mensajes para los `retcode` con arreglo conocido. El resto enseña el mensaje de HoYoLAB. */
  retcodeMessages?: Record<number, string>;
}

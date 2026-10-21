import { NOTES_RETCODE_MESSAGES } from './notes-retcode-messages.const.ts';

/** Como las notas, salvo que el diario necesita también la cookie de canje (Star Rail no responde sin ella). */
export const LEDGER_RETCODE_MESSAGES: Record<number, string> = {
  ...NOTES_RETCODE_MESSAGES,
  [-100]: 'HoYoLAB no acepta las cookies: copia de nuevo la de HoYoLAB y la de canje (sección Control)',
};

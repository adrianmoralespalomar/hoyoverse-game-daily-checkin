/** Errores del historial de tiradas con arreglo conocido. */
export const GACHA_LOG_RETCODE_MESSAGES: Record<number, string> = {
  [-100]: 'El enlace no vale: vuelve a sacarlo con el script después de abrir el historial en el juego',
  [-101]: 'El enlace ha caducado (dura 24 horas): abre el historial en el juego y sácalo de nuevo',
};

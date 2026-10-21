/** Sesión del panel tras poner la contraseña: una cookie firmada que se recuerda en ese navegador. */
export const AUTH_SESSION = {
  cookieName: 'hoyo_games_sesion',
  maxAgeSeconds: 365 * 24 * 60 * 60,
  /** Espera tras una contraseña incorrecta, para que no se puedan probar muchas seguidas. */
  failedLoginDelayMs: 1_500,
} as const;

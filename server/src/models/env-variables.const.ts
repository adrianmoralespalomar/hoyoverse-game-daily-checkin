/** Variables del `.env`. Los UID de cada juego van en `HoyoverseGameConfig.uidEnvVariable`. */
export const ENV_VARIABLES = {
  /** Cookie de hoyolab.com para el check-in: `ltuid_v2=...; ltoken_v2=...`. */
  checkInCookie: 'HOYOLAB_COOKIE',
  /** Cookie de hoyoverse.com para canjear: `account_id_v2=...; account_mid_v2=...; cookie_token_v2=...`. Sin ella no se canjea. */
  redeemCookie: 'HOYOVERSE_REDEEM_COOKIE',
  games: 'GAMES',
  checkInLanguage: 'HOYOLAB_LANG',
  startJitterSeconds: 'START_JITTER_SECONDS',
  /** Contraseña del panel. Sin ella, cualquiera de tu red puede verlo. */
  webPassword: 'WEB_PASSWORD',
  host: 'HOST',
  port: 'PORT',
  dataDirectory: 'DATA_DIR',
} as const;

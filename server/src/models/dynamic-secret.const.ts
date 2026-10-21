/** Firma `DS` que piden las notas en tiempo real en los servidores globales (la misma que usa genshin.py). */
export const DYNAMIC_SECRET = {
  salt: '6s25p5ox5y14umn1p61aqyyvbvvl3lrt',
  appVersion: '1.5.0',
  clientType: '5',
  randomLength: 6,
  randomAlphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
} as const;

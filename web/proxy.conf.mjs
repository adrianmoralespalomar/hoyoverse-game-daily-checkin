// En `ng serve`, las llamadas a /api van al daemon de HOYO_GAMES_URL. Por defecto, el del NAS (datos reales).
export default {
  '/api': {
    target: process.env.HOYO_GAMES_URL ?? 'http://192.168.1.142:4330',
    secure: false,
  },
};

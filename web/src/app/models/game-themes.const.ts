import type { GameId } from './game-id.type';
import type { GameTheme } from './game-theme.interface';

export const GAME_THEMES: Record<GameId, GameTheme> = {
  gi: {
    accent: '#e8c26a',
    shortName: 'Genshin',
    currencyName: 'protogemas',
    topRankLabel: '5★',
    checkInUrl: 'https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481',
    redeemUrl: 'https://genshin.hoyoverse.com/gift',
    // Simulador de equipos de HoYoLAB: lo enlaza la propia Crónica de batalla y agrega lo que publica la comunidad
    endgameGuideUrl: 'https://act.hoyolab.com/ys/event/bbs-lineup-ys-sea/index.html#/pc/home',
    endgameGuideName: 'Equipos de la comunidad en HoYoLAB',
  },
  hsr: {
    accent: '#9db0ff',
    shortName: 'Star Rail',
    currencyName: 'jade estelar',
    topRankLabel: '5★',
    checkInUrl: 'https://act.hoyolab.com/bbs/event/signin/hkrpg/e202303301540311.html?act_id=e202303301540311',
    redeemUrl: 'https://hsr.hoyoverse.com/gift',
    endgameGuideUrl: 'https://www.prydwen.gg/star-rail/',
    endgameGuideName: 'Equipos y uso en Prydwen',
  },
  zzz: {
    accent: '#ff8a3d',
    shortName: 'Zenless',
    currencyName: 'películas',
    topRankLabel: 'S',
    checkInUrl: 'https://act.hoyolab.com/bbs/event/signin/zzz/e202406031448091.html?act_id=e202406031448091',
    redeemUrl: 'https://zenless.hoyoverse.com/redemption',
    endgameGuideUrl: 'https://www.prydwen.gg/zenless/',
    endgameGuideName: 'Equipos y uso en Prydwen',
  },
};

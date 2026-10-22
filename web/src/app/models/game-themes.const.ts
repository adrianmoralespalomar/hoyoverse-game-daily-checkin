import type { GameId } from './game-id.type';
import type { GameTheme } from './game-theme.interface';

export const GAME_THEMES: Record<GameId, GameTheme> = {
  gi: {
    accent: '#e8c26a',
    shortName: 'Genshin',
    currencyName: 'protogemas',
    topRankLabel: '5★',
    monthlyCardName: 'Bendición de la Luna - Welkin',
    battlePassName: 'Pase de batalla - Himno gnóstico',
    f2pSheetUrl: 'https://docs.google.com/spreadsheets/d/1l9HPu2cAzTckdXtr7u-7D8NSKzZNUqOuvbmxERFZ_6w/edit?gid=955728278',
    f2pSheetName: 'Hoja de tiradas F2P de Genshin (sectoidfodder)',
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
    monthlyCardName: 'Pase de suministros exprés',
    battlePassName: 'Pase de batalla - Nameless Glory',
    f2pSheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRIWjzFwAZZoBvKw2oiNaVpppI9atoV0wxuOjulKRJECrg_BN404d7LoKlHp8RMX8hegDr4b8jlHjYy/pubhtml',
    f2pSheetName: 'Hoja de tiradas F2P de Star Rail',
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
    monthlyCardName: 'Membresía de Inter-Knot',
    battlePassName: 'Pase de batalla',
    f2pSheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTiSx8OSyx-BZktnpT-fh_pQHjjkD8q3sp3Csy2aOI-8CV_QroqxzhhNjiCZNV4IdzhyK3xbipZn9WD/pubhtml',
    f2pSheetName: 'Hoja de tiradas F2P de Zenless',
    checkInUrl: 'https://act.hoyolab.com/bbs/event/signin/zzz/e202406031448091.html?act_id=e202406031448091',
    redeemUrl: 'https://zenless.hoyoverse.com/redemption',
    endgameGuideUrl: 'https://www.prydwen.gg/zenless/',
    endgameGuideName: 'Equipos y uso en Prydwen',
  },
};

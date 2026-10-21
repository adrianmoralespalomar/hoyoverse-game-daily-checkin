import type { GameId } from './game-id.type';
import type { GameTheme } from './game-theme.interface';

export const GAME_THEMES: Record<GameId, GameTheme> = {
  gi: {
    accent: '#e8c26a',
    shortName: 'Genshin',
    checkInUrl: 'https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481',
    redeemUrl: 'https://genshin.hoyoverse.com/gift',
  },
  hsr: {
    accent: '#9db0ff',
    shortName: 'Star Rail',
    checkInUrl: 'https://act.hoyolab.com/bbs/event/signin/hkrpg/e202303301540311.html?act_id=e202303301540311',
    redeemUrl: 'https://hsr.hoyoverse.com/gift',
  },
  zzz: {
    accent: '#ff8a3d',
    shortName: 'Zenless',
    checkInUrl: 'https://act.hoyolab.com/bbs/event/signin/zzz/e202406031448091.html?act_id=e202406031448091',
    redeemUrl: 'https://zenless.hoyoverse.com/redemption',
  },
};

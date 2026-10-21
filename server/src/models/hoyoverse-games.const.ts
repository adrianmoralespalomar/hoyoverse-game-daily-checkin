import type { HoyoverseGameConfig } from './hoyoverse-game-config.interface.ts';

export const HOYOVERSE_GAMES: HoyoverseGameConfig[] = [
  {
    id: 'gi',
    name: 'Genshin Impact',
    region: 'os_euro',
    checkIn: {
      signUrl: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign',
      infoUrl: 'https://sg-hk4e-api.hoyolab.com/event/sol/info',
      homeUrl: 'https://sg-hk4e-api.hoyolab.com/event/sol/home',
      actId: 'e202102251931481',
    },
    redeem: {
      method: 'GET',
      url: 'https://public-operation-hk4e.hoyoverse.com/common/apicdkey/api/webExchangeCdkey',
      gameBiz: 'hk4e_global',
      siteOrigin: 'https://genshin.hoyoverse.com',
    },
    notesUrl: 'https://sg-public-api.hoyolab.com/event/game_record/genshin/api/dailyNote',
    codesApiGame: 'genshin',
    uidEnvVariable: 'GI_UID',
  },
  {
    id: 'hsr',
    name: 'Honkai: Star Rail',
    region: 'prod_official_eur',
    checkIn: {
      signUrl: 'https://sg-public-api.hoyolab.com/event/luna/os/sign',
      infoUrl: 'https://sg-public-api.hoyolab.com/event/luna/os/info',
      homeUrl: 'https://sg-public-api.hoyolab.com/event/luna/os/home',
      actId: 'e202303301540311',
    },
    redeem: {
      method: 'POST',
      url: 'https://public-operation-hkrpg.hoyoverse.com/common/apicdkey/api/webExchangeCdkeyRisk',
      gameBiz: 'hkrpg_global',
      siteOrigin: 'https://hsr.hoyoverse.com',
    },
    notesUrl: 'https://bbs-api-os.hoyolab.com/game_record/hkrpg/api/note',
    codesApiGame: 'hkrpg',
    uidEnvVariable: 'HSR_UID',
  },
  {
    id: 'zzz',
    name: 'Zenless Zone Zero',
    region: 'prod_gf_eu',
    checkIn: {
      signUrl: 'https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/sign',
      infoUrl: 'https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/info',
      homeUrl: 'https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/home',
      actId: 'e202406031448091',
    },
    redeem: {
      method: 'POST',
      url: 'https://public-operation-nap.hoyoverse.com/common/apicdkey/api/webExchangeCdkeyRisk',
      gameBiz: 'nap_global',
      siteOrigin: 'https://zenless.hoyoverse.com',
    },
    notesUrl: 'https://sg-act-public-api.hoyolab.com/event/game_record_zzz/api/zzz/note',
    codesApiGame: 'nap',
    uidEnvVariable: 'ZZZ_UID',
  },
];

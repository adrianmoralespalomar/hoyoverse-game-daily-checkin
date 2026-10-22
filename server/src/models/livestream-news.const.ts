import type { GameId } from './game-id.type.ts';

/** Noticias públicas de HoYoLAB (no piden cookie): el directo se anuncia en las de tipo `3`, información. */
export const LIVESTREAM_NEWS = {
  apiUrl: 'https://bbs-api-os.hoyolab.com/community/post/wapi/getNewsList',
  infoNewsType: 3,
  pageSize: 25,
  /** Con este idioma el anuncio trae la fecha como `10/23/2026 at 08:00 AM (UTC-4)`. */
  language: 'en-us',
  announcementSubjectPattern: /special program/i,
  gameIds: { gi: 2, hsr: 6, zzz: 8 } satisfies Record<GameId, number>,
} as const;

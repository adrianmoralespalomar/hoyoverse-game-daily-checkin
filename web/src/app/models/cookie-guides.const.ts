import type { CookieGuide } from './cookie-guide.interface';
import type { CookieKind } from './cookie-kind.type';

export const COOKIE_GUIDES: Record<CookieKind, CookieGuide> = {
  checkIn: {
    title: 'Cookie del check-in',
    siteUrl: 'https://www.hoyolab.com',
    cookieDomain: '.hoyolab.com',
    cookieNames: ['ltuid_v2', 'ltoken_v2'],
    envLine: 'HOYOLAB_COOKIE=ltuid_v2=…; ltoken_v2=v2_…',
  },
  redeem: {
    title: 'Cookie del canje',
    siteUrl: 'https://hsr.hoyoverse.com/gift',
    cookieDomain: '.hoyoverse.com',
    cookieNames: ['account_id_v2', 'account_mid_v2', 'cookie_token_v2'],
    envLine: 'HOYOVERSE_REDEEM_COOKIE=account_id_v2=…; account_mid_v2=…; cookie_token_v2=v2_…',
  },
};

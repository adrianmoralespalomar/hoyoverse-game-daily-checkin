/** Pasos para sacar una cookie desde el navegador y pegarla en el `.env`. */
export interface CookieGuide {
  title: string;
  siteUrl: string;
  /** Dominio que hay que elegir en F12 → Application → Cookies (y en la columna Domain si salen repetidas). */
  cookieDomain: string;
  cookieNames: string[];
  envLine: string;
}

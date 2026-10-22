/** Directo de presentación de una versión, anunciado en las noticias de HoYoLAB. */
export interface Livestream {
  /** Título de la noticia, por ejemplo `Genshin Impact Version 7.2 Special Program Preview`. */
  subject: string;
  /** Versión que presenta, por ejemplo `7.2`. */
  version: string | null;
  startsAt: string;
}

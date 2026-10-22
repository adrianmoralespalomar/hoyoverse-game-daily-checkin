import { parseLivestream } from '../core/livestream-parser.ts';
import { readDataFile, writeDataFile } from '../core/data-file-store.ts';
import { log } from '../core/log.ts';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';
import type { GameId } from '../models/game-id.type.ts';
import type { GameModule } from '../models/game-module.interface.ts';
import { LIVESTREAM_NEWS } from '../models/livestream-news.const.ts';
import type { Livestream } from '../models/livestream.interface.ts';
import { REQUEST_PACING } from '../models/request-pacing.const.ts';

interface NewsListResponse {
  data?: { list?: { post: { subject: string; desc: string } }[] };
}

/**
 * Directo de presentación de la próxima versión de cada juego, según las noticias de HoYoLAB. Solo sale cuando el
 * anuncio trae fecha. Se guarda en `data/livestreams.json`.
 */
export class LivestreamService {
  #livestreams: Partial<Record<GameId, Livestream>> = readDataFile(DATA_FILE_NAMES.livestreams, {});
  #games: GameModule[];

  constructor(games: GameModule[]) {
    this.#games = games;
  }

  /** No lanza: si un juego falla se queda con el directo que ya tenía. */
  async refresh(): Promise<void> {
    for (const game of this.#games) {
      try {
        const livestream = await this.#fetchLatestLivestream(game.id);
        if (livestream) this.#livestreams[game.id] = livestream;
      } catch (error) {
        log('ERROR', `${game.name}: no se pudieron leer las noticias del directo (${(error as Error).message})`);
      }
    }
    writeDataFile(DATA_FILE_NAMES.livestreams, this.#livestreams);
  }

  getAll(): Partial<Record<GameId, Livestream>> {
    return this.#livestreams;
  }

  async #fetchLatestLivestream(gameId: GameId): Promise<Livestream | null> {
    const url = new URL(LIVESTREAM_NEWS.apiUrl);
    url.searchParams.set('gids', String(LIVESTREAM_NEWS.gameIds[gameId]));
    url.searchParams.set('type', String(LIVESTREAM_NEWS.infoNewsType));
    url.searchParams.set('page_size', String(LIVESTREAM_NEWS.pageSize));
    const response = await fetch(url, { headers: { 'x-rpc-language': LIVESTREAM_NEWS.language }, signal: AbortSignal.timeout(REQUEST_PACING.timeoutMs) });
    if (!response.ok) throw new Error(`HoYoLAB respondió HTTP ${response.status}`);
    const { data } = await response.json() as NewsListResponse;
    // Las noticias vienen de la más nueva a la más antigua
    for (const { post } of data?.list ?? []) {
      if (!LIVESTREAM_NEWS.announcementSubjectPattern.test(post.subject)) continue;
      const livestream = parseLivestream(post.subject, post.desc);
      if (livestream) return livestream;
    }
    return null;
  }
}

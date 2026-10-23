import webpush, { type PushSubscription } from 'web-push';
import { readDataFile, writeDataFile } from '../core/data-file-store.ts';
import { log } from '../core/log.ts';
import type { AppAlert } from '../models/app-alert.interface.ts';
import { DATA_FILE_NAMES } from '../models/data-file-names.const.ts';
import type { GameId } from '../models/game-id.type.ts';
import type { GameModule } from '../models/game-module.interface.ts';
import type { PushNotificationPayload } from '../models/push-notification-payload.interface.ts';
import type { PushStoreData } from '../models/push-store-data.interface.ts';
import { PUSH } from '../models/push.const.ts';

/** Manda los avisos del panel al móvil como notificaciones, aunque la app esté cerrada. Se guarda en `data/push.json`. */
export class PushService {
  #data: PushStoreData = readDataFile<PushStoreData>(DATA_FILE_NAMES.push, { vapidKeys: null, subscriptions: [], sentAlertIds: [] });
  #gameNames: Partial<Record<GameId, string>>;

  constructor(games: GameModule[]) {
    this.#gameNames = Object.fromEntries(games.map(({ id, name }) => [id, name]));
    this.#data.vapidKeys ??= webpush.generateVAPIDKeys();
    this.#save();
    webpush.setVapidDetails(PUSH.vapidSubject, this.#data.vapidKeys.publicKey, this.#data.vapidKeys.privateKey);
  }

  getPublicKey(): string {
    return this.#data.vapidKeys!.publicKey;
  }

  subscribe(subscription: unknown): void {
    const { endpoint, keys } = (subscription ?? {}) as Partial<PushSubscription>;
    if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') || !keys?.p256dh || !keys.auth) throw new Error('Suscripción no válida');
    this.#data.subscriptions = [...this.#data.subscriptions.filter(saved => saved.endpoint !== endpoint), { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } }];
    this.#save();
  }

  unsubscribe(endpoint: unknown): void {
    this.#data.subscriptions = this.#data.subscriptions.filter(saved => saved.endpoint !== endpoint);
    this.#save();
  }

  async sendTest(): Promise<void> {
    if (!this.#data.subscriptions.length) throw new Error('Este móvil aún no tiene los avisos activados');
    await this.#sendToAll({ title: 'Hoyo Games', body: 'Las notificaciones funcionan.', tag: 'test', url: './' });
  }

  /** Manda los avisos que no se habían mandado ya (salvo los que no van al móvil). Los que dejan de estar activos se olvidan, y si vuelven suenan otra vez. */
  async notifyNewAlerts(alerts: AppAlert[]): Promise<void> {
    const pushableAlerts = alerts.filter(({ pushNotification }) => pushNotification !== null);
    const freshAlerts = pushableAlerts.filter(({ id }) => !this.#data.sentAlertIds.includes(id));
    this.#data.sentAlertIds = pushableAlerts.map(({ id }) => id);
    this.#save();
    for (const alert of freshAlerts) {
      const { title, body } = alert.pushNotification ?? { title: alert.title, body: alert.message };
      const gameName = alert.gameId && this.#gameNames[alert.gameId];
      await this.#sendToAll({ title: gameName ? `${gameName}: ${title}` : title, body, tag: alert.id, url: `./${alert.href ?? ''}` });
    }
  }

  async #sendToAll(payload: PushNotificationPayload): Promise<void> {
    const results = await Promise.allSettled(this.#data.subscriptions.map(subscription =>
      webpush.sendNotification(subscription, JSON.stringify(payload), { TTL: PUSH.timeToLiveSeconds })));
    const goneEndpoints = new Set<string>();
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') return;
      const { statusCode, message } = result.reason as { statusCode?: number; message: string };
      if (statusCode && PUSH.goneStatusCodes.includes(statusCode as 404 | 410)) goneEndpoints.add(this.#data.subscriptions[index].endpoint);
      else log('ERROR', `No se pudo mandar la notificación (${message})`);
    });
    if (!goneEndpoints.size) return;
    this.#data.subscriptions = this.#data.subscriptions.filter(({ endpoint }) => !goneEndpoints.has(endpoint));
    this.#save();
  }

  #save(): void {
    writeDataFile(DATA_FILE_NAMES.push, this.#data);
  }
}

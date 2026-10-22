import type { PushSubscription } from 'web-push';

/** Contenido de `data/push.json`. */
export interface PushStoreData {
  /** Claves con las que el servidor se identifica ante el servicio de notificaciones. Se generan una vez. */
  vapidKeys: { publicKey: string; privateKey: string } | null;
  /** Un móvil o navegador por suscripción. */
  subscriptions: PushSubscription[];
  /** Avisos activos que ya se han mandado: así cada uno suena una sola vez mientras dure. */
  sentAlertIds: string[];
}

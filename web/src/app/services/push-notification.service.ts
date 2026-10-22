import { inject, Injectable, signal } from '@angular/core';
import { base64UrlToBytes } from '../utils/base64-url-to-bytes';
import { HoyoGamesApiService } from './hoyo-games-api.service';

/** Notificaciones del móvil: pide permiso, da de alta este dispositivo en el NAS y manda una de prueba. */
@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly hoyoGamesApi = inject(HoyoGamesApiService);

  /** Hace falta HTTPS (o localhost) y un navegador con notificaciones push. */
  readonly isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  readonly isEnabled = signal(false);
  readonly isWorking = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    if (this.isSupported) this.loadIsEnabled();
  }

  async enable(): Promise<void> {
    await this.run(async () => {
      if (await Notification.requestPermission() !== 'granted') throw new Error('Has bloqueado las notificaciones: actívalas en los ajustes del navegador para este sitio');
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToBytes(await this.hoyoGamesApi.getPushPublicKey()),
      });
      await this.hoyoGamesApi.savePushSubscription(subscription.toJSON());
      this.isEnabled.set(true);
    });
  }

  async disable(): Promise<void> {
    await this.run(async () => {
      const subscription = await this.getSubscription();
      if (subscription) await this.hoyoGamesApi.removePushSubscription(subscription.endpoint);
      await subscription?.unsubscribe();
      this.isEnabled.set(false);
    });
  }

  async sendTest(): Promise<void> {
    await this.run(() => this.hoyoGamesApi.sendTestPush());
  }

  private async loadIsEnabled(): Promise<void> {
    this.isEnabled.set(Notification.permission === 'granted' && !!await this.getSubscription());
  }

  private async getSubscription(): Promise<PushSubscription | null> {
    return (await navigator.serviceWorker.ready).pushManager.getSubscription();
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.isWorking.set(true);
    this.error.set(null);
    try {
      await action();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : String(error));
    } finally {
      this.isWorking.set(false);
    }
  }
}

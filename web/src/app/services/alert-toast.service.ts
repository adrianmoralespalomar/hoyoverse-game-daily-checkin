import { Injectable, signal } from '@angular/core';
import type { AppAlert } from '../models/app-alert.interface';
import type { GameId } from '../models/game-id.type';

const SAMPLE_ALERT_GAME_IDS: GameId[] = ['gi', 'hsr', 'zzz'];

/** Avisos que se enseñan sin que los mande el NAS (el de prueba del panel de control). */
@Injectable({ providedIn: 'root' })
export class AlertToastService {
  readonly localAlerts = signal<AppAlert[]>([]);

  showSampleAlert(): void {
    this.localAlerts.update(alerts => [...alerts, {
      id: `prueba:${Date.now()}`,
      gameId: SAMPLE_ALERT_GAME_IDS[alerts.length % SAMPLE_ALERT_GAME_IDS.length],
      severity: 'warning',
      title: 'Aviso de prueba',
      message: 'Así se verán los avisos cuando entres al panel. Cada pulsación enseña el color de un juego. Se quedan hasta que los cierres.',
      href: '#control',
    }]);
  }
}

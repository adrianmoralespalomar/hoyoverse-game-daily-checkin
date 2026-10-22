import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { AuthStatus } from '../models/auth-status.interface';
import type { Dashboard } from '../models/dashboard.interface';
import type { GameId } from '../models/game-id.type';

/** Habla con el daemon del NAS. Las tareas se lanzan y el panel sigue su avance con `dashboard.isBusy`. */
@Injectable({ providedIn: 'root' })
export class HoyoGamesApiService {
  private readonly http = inject(HttpClient);

  readonly authStatus = httpResource<AuthStatus>(() => '/api/auth/status');
  readonly dashboard = httpResource<Dashboard>(() => '/api/dashboard');

  logIn(password: string): Promise<void> {
    return this.post('/api/auth/login', { password });
  }

  startCheckIn(): Promise<void> {
    return this.post('/api/check-in/run', {});
  }

  startCodeRedemption(): Promise<void> {
    return this.post('/api/codes/run', {});
  }

  /** Espera a que el NAS lea de nuevo la resina y la energía de todos los juegos (unos segundos). */
  refreshNotes(): Promise<void> {
    return this.post('/api/notes/refresh', {});
  }

  saveCheckInTime(checkInTime: string): Promise<void> {
    return this.post('/api/settings/check-in-time', { checkInTime }, 'PUT');
  }

  /** Espera a que el NAS lea de nuevo el calendario, el contenido final y el diario de todos los juegos. */
  refreshProgress(): Promise<void> {
    return this.post('/api/progress/refresh', {});
  }

  /** `pulls` a `null` borra la estimación. */
  saveF2pPulls(gameId: GameId, version: string, pulls: number | null): Promise<void> {
    return this.post('/api/settings/f2p-pulls', { gameId, version, pulls }, 'PUT');
  }

  /** Lo de pago que tienes: suma sus tiradas a lo que se espera en la versión. */
  saveIncomeExtras(gameId: GameId, monthlyCard: boolean, battlePass: boolean): Promise<void> {
    return this.post('/api/settings/income-extras', { gameId, monthlyCard, battlePass }, 'PUT');
  }

  /** El NAS reconoce el juego por el enlace y descarga el historial aparte (el panel sigue `isImporting`). */
  importWishes(link: string): Promise<void> {
    return this.post('/api/wishes/import', { link });
  }

  /** Lanza el mensaje del daemon (`{ error }`) en vez del genérico de Angular. */
  private async post(url: string, body: object, method: 'POST' | 'PUT' = 'POST'): Promise<void> {
    try {
      await firstValueFrom(this.http.request(method, url, { body }));
    } catch (error) {
      if (error instanceof HttpErrorResponse) throw new Error(error.error?.error ?? `El NAS respondió ${error.status}`);
      throw error;
    }
  }
}

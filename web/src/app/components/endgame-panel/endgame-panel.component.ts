import { DatePipe, DecimalPipe, formatNumber } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import type { EndgameModeView } from '../../models/endgame-mode-view.interface';
import type { GameDashboard } from '../../models/game-dashboard.interface';
import type { GameTheme } from '../../models/game-theme.interface';
import { ClockService } from '../../services/clock.service';
import { HoyoGamesApiService } from '../../services/hoyo-games-api.service';
import { formatDaysLeft } from '../../utils/time-left';

/** Contenido final del periodo (estrellas, lo que queda por ganar, cuándo se renueva) y eventos sin completar. */
@Component({
  imports: [DatePipe, DecimalPipe],
  selector: 'app-endgame-panel',
  styleUrl: './endgame-panel.component.scss',
  templateUrl: './endgame-panel.component.html',
})
export class EndgamePanelComponent {
  private readonly clock = inject(ClockService);
  private readonly hoyoGamesApi = inject(HoyoGamesApiService);

  readonly progressState = input.required<NonNullable<GameDashboard['progress']>>();
  readonly theme = input.required<GameTheme>();

  protected readonly isRefreshing = signal(false);
  protected readonly progress = computed(() => this.progressState().progress ?? null);
  protected readonly modes = computed<EndgameModeView[]>(() => {
    const now = this.clock.now();
    return (this.progress()?.endgame ?? []).map(mode => {
      const endsText = mode.endsAt ? formatDaysLeft(mode.endsAt, now) : null;
      if (mode.isComplete) return { ...mode, detailText: ['Completado', endsText && `se renueva: ${endsText}`].filter(Boolean).join(' · ') };
      const currencyText = mode.currencyLeft ? `Te quedan ~${formatNumber(mode.currencyLeft, 'es')} ${this.theme().currencyName}` : null;
      return { ...mode, detailText: [currencyText, endsText].filter(Boolean).join(' · ') };
    });
  });
  protected readonly pendingEvents = computed(() => {
    const now = this.clock.now();
    return (this.progress()?.pendingEvents ?? []).map(event => ({ ...event, endsText: event.endsAt ? formatDaysLeft(event.endsAt, now) : null }));
  });
  protected readonly pendingEventsCurrency = computed(() => this.pendingEvents().reduce((total, event) => total + event.currency, 0));

  protected async onRefreshProgressButtonClicked(): Promise<void> {
    this.isRefreshing.set(true);
    try {
      await this.hoyoGamesApi.refreshProgress();
      this.hoyoGamesApi.dashboard.reload();
    } finally {
      this.isRefreshing.set(false);
    }
  }
}

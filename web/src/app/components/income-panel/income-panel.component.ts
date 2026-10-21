import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { CURRENCY_PER_PULL } from '../../models/currency-per-pull.const';
import type { GameDashboard } from '../../models/game-dashboard.interface';
import type { GameId } from '../../models/game-id.type';
import type { GameTheme } from '../../models/game-theme.interface';
import { HoyoGamesApiService } from '../../services/hoyo-games-api.service';

/** Lo ganado en la versión según el diario, por fuente, y cuánto falta respecto a lo que apuntes de tu hoja F2P. */
@Component({
  imports: [DatePipe, DecimalPipe],
  selector: 'app-income-panel',
  styleUrl: './income-panel.component.scss',
  templateUrl: './income-panel.component.html',
})
export class IncomePanelComponent {
  private readonly hoyoGamesApi = inject(HoyoGamesApiService);

  readonly gameId = input.required<GameId>();
  readonly incomeState = input.required<NonNullable<GameDashboard['income']>>();
  /** Moneda que aún dan los eventos sin completar (del calendario). */
  readonly pendingEventsCurrency = input.required<number>();
  readonly theme = input.required<GameTheme>();

  protected readonly saveError = signal<string | null>(null);
  protected readonly income = computed(() => this.incomeState().income ?? null);
  protected readonly pulls = computed(() => Math.floor((this.income()?.total ?? 0) / CURRENCY_PER_PULL));
  protected readonly sources = computed(() => {
    const sources = this.income()?.bySource ?? [];
    const maxAmount = Math.max(1, ...sources.map(source => source.amount));
    return sources.map(source => ({ ...source, percent: (source.amount / maxAmount) * 100 }));
  });
  /** Lo que hay escrito en el campo. Vuelve a lo guardado cuando cambia en el NAS. */
  protected readonly f2pPullsDraft = linkedSignal(() => this.income()?.f2pPulls?.toString() ?? '');
  protected readonly pendingEventsPulls = computed(() => Math.floor(this.pendingEventsCurrency() / CURRENCY_PER_PULL));

  protected async onF2pPullsFormSubmitted(): Promise<void> {
    const income = this.income();
    if (!income) return;
    this.saveError.set(null);
    try {
      const draft = this.f2pPullsDraft().trim();
      await this.hoyoGamesApi.saveF2pPulls(this.gameId(), income.versionName, draft ? Number(draft) : null);
      this.hoyoGamesApi.dashboard.reload();
    } catch (error) {
      this.saveError.set(error instanceof Error ? error.message : String(error));
    }
  }

  protected onF2pPullsChanged(event: Event): void {
    this.f2pPullsDraft.set((event.target as HTMLInputElement).value);
  }
}

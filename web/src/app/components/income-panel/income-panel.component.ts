import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { CURRENCY_PER_PULL } from '../../models/currency-per-pull.const';
import type { GameDashboard } from '../../models/game-dashboard.interface';
import type { GameId } from '../../models/game-id.type';
import type { GameTheme } from '../../models/game-theme.interface';
import { SHEET_KIND_LABELS } from '../../models/sheet-kind-labels.const';
import { HoyoGamesApiService } from '../../services/hoyo-games-api.service';

/** Lo ganado en la versión según el diario, por fuente, y cuánto falta respecto a lo que gana un F2P (según la hoja). */
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

  protected readonly isInfoOpen = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly sheetKindLabels = SHEET_KIND_LABELS;
  protected readonly income = computed(() => this.incomeState().income ?? null);
  protected readonly target = computed(() => this.income()?.target ?? null);
  protected readonly pulls = computed(() => Math.floor((this.income()?.total ?? 0) / CURRENCY_PER_PULL));
  protected readonly sources = computed(() => {
    const sources = this.income()?.bySource ?? [];
    const maxAmount = Math.max(1, ...sources.map(source => source.amount));
    return sources.map(source => ({ ...source, percent: (source.amount / maxAmount) * 100 }));
  });
  /** Lo que hay escrito en el campo. Vuelve a lo guardado cuando cambia en el NAS. */
  protected readonly f2pPullsDraft = linkedSignal(() => this.target()?.manualPulls?.toString() ?? '');
  protected readonly pendingEventsPulls = computed(() => Math.floor(this.pendingEventsCurrency() / CURRENCY_PER_PULL));

  protected onInfoButtonClicked(): void {
    this.isInfoOpen.update(isOpen => !isOpen);
  }

  protected onMonthlyCardChanged(event: Event): void {
    this.saveExtras((event.target as HTMLInputElement).checked, this.target()!.battlePass.isEnabled);
  }

  protected onBattlePassChanged(event: Event): void {
    this.saveExtras(this.target()!.monthlyCard.isEnabled, (event.target as HTMLInputElement).checked);
  }

  protected onF2pPullsChanged(event: Event): void {
    this.f2pPullsDraft.set((event.target as HTMLInputElement).value);
  }

  protected async onF2pPullsFormSubmitted(): Promise<void> {
    const income = this.income();
    if (!income) return;
    const draft = this.f2pPullsDraft().trim();
    await this.runAction(() => this.hoyoGamesApi.saveF2pPulls(this.gameId(), income.versionName, draft ? Number(draft) : null));
  }

  private saveExtras(monthlyCard: boolean, battlePass: boolean): Promise<void> {
    return this.runAction(() => this.hoyoGamesApi.saveIncomeExtras(this.gameId(), monthlyCard, battlePass));
  }

  private async runAction(action: () => Promise<void>): Promise<void> {
    this.saveError.set(null);
    try {
      await action();
      this.hoyoGamesApi.dashboard.reload();
    } catch (error) {
      this.saveError.set(error instanceof Error ? error.message : String(error));
    }
  }
}

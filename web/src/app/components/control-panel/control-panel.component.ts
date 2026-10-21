import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { COOKIE_DESCRIPTIONS } from '../../models/cookie-descriptions.const';
import { COOKIE_HEALTH_LABELS } from '../../models/cookie-health-labels.const';
import type { CookieKind } from '../../models/cookie-kind.type';
import type { Dashboard } from '../../models/dashboard.interface';
import { HoyoGamesApiService } from '../../services/hoyo-games-api.service';
import { CookieGuideComponent } from '../cookie-guide/cookie-guide.component';

/** Hora del check-in, estado de las cookies, cómo renovarlas y botones para no esperar a la próxima ronda. */
@Component({
  imports: [CookieGuideComponent, DatePipe],
  selector: 'app-control-panel',
  styleUrl: './control-panel.component.scss',
  templateUrl: './control-panel.component.html',
})
export class ControlPanelComponent {
  private readonly hoyoGamesApi = inject(HoyoGamesApiService);

  readonly dashboard = input.required<Dashboard>();

  protected readonly actionError = signal<string | null>(null);
  /** Lo que hay escrito en el campo de hora. Vuelve a la hora guardada cuando cambia en el NAS. */
  protected readonly checkInTimeDraft = linkedSignal(() => this.dashboard().checkInTimeLabel);
  protected readonly cookieHealthLabels = COOKIE_HEALTH_LABELS;
  protected readonly cookies = computed(() => (Object.keys(COOKIE_DESCRIPTIONS) as CookieKind[]).map(kind => ({
    kind,
    ...COOKIE_DESCRIPTIONS[kind],
    ...this.dashboard().cookies[kind],
  })));
  protected readonly hasCookieProblem = computed(() => this.cookies().some(({ health }) => health === 'missing' || health === 'expired'));

  protected onCheckInTimeFormSubmitted(): void {
    this.runAction(() => this.hoyoGamesApi.saveCheckInTime(this.checkInTimeDraft()));
  }

  private async runAction(action: () => Promise<void>): Promise<void> {
    this.actionError.set(null);
    try {
      await action();
      this.hoyoGamesApi.dashboard.reload();
    } catch (error) {
      this.actionError.set(error instanceof Error ? error.message : String(error));
    }
  }

  protected onCheckInTimeChanged(event: Event): void {
    this.checkInTimeDraft.set((event.target as HTMLInputElement).value);
  }

  protected onCheckInButtonClicked(): void {
    this.runAction(() => this.hoyoGamesApi.startCheckIn());
  }

  protected onRedeemCodesButtonClicked(): void {
    this.runAction(() => this.hoyoGamesApi.startCodeRedemption());
  }
}

import { Component, computed, inject, input, signal } from '@angular/core';
import { ALERT_FALLBACK_COLORS } from '../../models/alert-fallback-colors.const';
import { GAME_THEMES } from '../../models/game-themes.const';
import type { AppAlert } from '../../models/app-alert.interface';
import { AlertToastService } from '../../services/alert-toast.service';

/**
 * Avisos importantes abajo a la derecha. Salen cada vez que abres el panel mientras se cumplan; al cerrarlos no
 * vuelven hasta recargar.
 */
@Component({
  selector: 'app-alert-toasts',
  styleUrl: './alert-toasts.component.scss',
  templateUrl: './alert-toasts.component.html',
})
export class AlertToastsComponent {
  private readonly alertToastService = inject(AlertToastService);

  readonly alerts = input.required<AppAlert[]>();

  private readonly dismissedAlertIds = signal<ReadonlySet<string>>(new Set());
  protected readonly visibleAlerts = computed(() => [...this.alerts(), ...this.alertToastService.localAlerts()]
    .filter(({ id }) => !this.dismissedAlertIds().has(id))
    .map(alert => {
      const theme = alert.gameId ? GAME_THEMES[alert.gameId] : null;
      return { ...alert, accent: theme?.accent ?? ALERT_FALLBACK_COLORS[alert.severity], logoUrl: theme?.logoUrl ?? null, titleText: theme ? `${theme.shortName}: ${alert.title}` : alert.title };
    }));

  protected onDismissButtonClicked(alertId: string): void {
    this.dismissedAlertIds.update(ids => new Set(ids).add(alertId));
  }
}

import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import type { CalendarDay } from '../../models/calendar-day.interface';
import { CHECK_IN_STATUS_LABELS } from '../../models/check-in-status-labels.const';
import { CODE_STATUS_LABELS } from '../../models/code-status-labels.const';
import type { GameDashboard } from '../../models/game-dashboard.interface';
import { GAME_THEMES } from '../../models/game-themes.const';
import { VISIBLE_INACTIVE_CODES_LIMIT } from '../../models/visible-inactive-codes-limit.const';
import { getTodayRewardIndex } from '../../utils/today-reward';
import { EndgamePanelComponent } from '../endgame-panel/endgame-panel.component';
import { EnergyPanelComponent } from '../energy-panel/energy-panel.component';
import { IncomePanelComponent } from '../income-panel/income-panel.component';
import { WishPanelComponent } from '../wish-panel/wish-panel.component';

/**
 * Un capítulo por juego: su energía, contenido final, ingresos de la versión, tiradas, el calendario del mes (se va
 * sellando al hacer scroll) y sus códigos.
 */
@Component({
  imports: [DatePipe, EndgamePanelComponent, EnergyPanelComponent, IncomePanelComponent, WishPanelComponent],
  selector: 'app-game-chapter',
  styleUrl: './game-chapter.component.scss',
  templateUrl: './game-chapter.component.html',
})
export class GameChapterComponent {
  readonly checkInTimeLabel = input.required<string>();
  readonly game = input.required<GameDashboard>();

  protected readonly codeStatusLabels = CODE_STATUS_LABELS;
  protected readonly theme = computed(() => GAME_THEMES[this.game().id]);
  protected readonly pendingEventsCurrency = computed(() => (this.game().progress?.progress?.pendingEvents ?? []).reduce((total, event) => total + event.currency, 0));
  protected readonly summary = computed(() => this.game().checkIn?.summary ?? null);
  /** Algo del check-in de hoy que tienes que resolver tú. */
  protected readonly checkInProblem = computed(() => {
    const checkIn = this.game().checkIn;
    const status = checkIn?.lastResult?.status;
    if (!checkIn || checkIn.isDoneToday || !status || status === 'ok' || status === 'already') return null;
    return `${CHECK_IN_STATUS_LABELS[status]}: ${checkIn.lastResult!.message}`;
  });
  protected readonly calendarDays = computed<CalendarDay[]>(() => {
    const summary = this.summary();
    const todayIndex = getTodayRewardIndex(this.game());
    return (summary?.monthRewards ?? []).map((reward, index) => ({
      reward,
      isClaimed: index < summary!.totalSignDays,
      isToday: index === todayIndex,
    }));
  });
  protected readonly codes = computed(() => {
    const allCodes = this.game().codes?.codes ?? [];
    const visibleCodes = [...allCodes.filter(code => code.isActive), ...allCodes.filter(code => !code.isActive).slice(0, VISIBLE_INACTIVE_CODES_LIMIT)];
    // La fuente da las recompensas como "Primogem*60;Mora*20000"
    return visibleCodes.map(code => ({ ...code, rewards: code.rewards.replaceAll('*', ' ×').replaceAll(';', ', ') }));
  });
}

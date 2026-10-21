import { formatDate } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { CHECK_IN_STATUS_LABELS } from '../../models/check-in-status-labels.const';
import type { Dashboard } from '../../models/dashboard.interface';
import type { GameDashboard } from '../../models/game-dashboard.interface';
import { GAME_THEMES } from '../../models/game-themes.const';
import type { TodayStamp } from '../../models/today-stamp.interface';
import { ClockService } from '../../services/clock.service';
import { getHoyolabDayKey } from '../../utils/hoyolab-day';
import { estimateStamina } from '../../utils/realtime-notes';
import { formatDaysLeft } from '../../utils/time-left';
import { getTodayReward } from '../../utils/today-reward';

/** Lo primero que se ve: un sello por juego con la recompensa de hoy, que cae al cargar. */
@Component({
  selector: 'app-today-hero',
  styleUrl: './today-hero.component.scss',
  templateUrl: './today-hero.component.html',
})
export class TodayHeroComponent {
  private readonly clock = inject(ClockService);

  readonly dashboard = input.required<Dashboard>();

  protected readonly dayLabel = computed(() => formatDate(`${this.dashboard().hoyolabDay}T12:00:00`, 'EEEE d \'de\' MMMM', 'es'));
  protected readonly stamps = computed(() => this.dashboard().games.filter(game => game.checkIn).map(game => this.toStamp(game)));
  protected readonly headline = computed(() => {
    const stamps = this.stamps();
    const pendingCount = stamps.filter(stamp => !stamp.isDone).length;
    if (!stamps.length) return 'Pon tu cookie de HoYoLAB en el .env para empezar.';
    if (stamps.some(stamp => stamp.needsYou)) return 'Hoy hay un sello que tienes que poner tú.';
    if (!pendingCount) return 'Hoy ya está todo sellado.';
    if (stamps.some(stamp => stamp.hasFailed)) return 'Un sello ha fallado. Se reintenta solo cada hora.';
    const pendingText = pendingCount === 1 ? 'Falta un sello. Se pone solo' : `Faltan ${pendingCount} sellos. Se ponen solos`;
    return `${pendingText} a las ${this.dashboard().checkInTimeLabel}.`;
  });

  private toStamp(game: GameDashboard): TodayStamp {
    const checkIn = game.checkIn!;
    const theme = GAME_THEMES[game.id];
    const status = checkIn.lastResult?.status;
    const isToday = !!checkIn.lastRunAt && getHoyolabDayKey(checkIn.lastRunAt) === this.dashboard().hoyolabDay;
    const needsYou = !checkIn.isDoneToday && isToday && (status === 'captcha' || status === 'bad_cookie');
    const hasFailed = !checkIn.isDoneToday && isToday && status === 'error';
    return {
      gameId: game.id,
      shortName: theme.shortName,
      accent: theme.accent,
      reward: getTodayReward(game),
      isDone: checkIn.isDoneToday,
      needsYou,
      hasFailed,
      statusText: this.getStampStatusText(checkIn, needsYou || hasFailed),
      energyText: this.getEnergyText(game),
      calendarLines: this.getCalendarLines(game),
    };
  }

  private getEnergyText(game: GameDashboard): string | null {
    const notes = game.notes?.notes;
    return notes ? `${notes.stamina.label} ${estimateStamina(notes, this.clock.now())}/${notes.stamina.max}` : null;
  }

  /** Lo que queda de versión y de los banners de personaje (cambian a mitad de versión). */
  private getCalendarLines(game: GameDashboard): string[] {
    const progress = game.progress?.progress;
    if (!progress) return [];
    const now = this.clock.now();
    const lines: string[] = [];
    const { version } = progress;
    if (version) lines.push(`Versión ${version.name}: ${formatDaysLeft(version.endsAt, now)}${version.estimatedEdge === 'end' ? ' (aprox.)' : ''}`);
    const characterBanners = progress.banners.filter(banner => banner.kind === 'character');
    const featured = characterBanners.flatMap(banner => banner.featured);
    if (featured.length) {
      const bannersEndAt = characterBanners.map(banner => banner.endsAt).sort()[0];
      lines.push(`${featured.join(' y ')}: ${formatDaysLeft(bannersEndAt, now)}`);
    }
    return lines;
  }

  private getStampStatusText(checkIn: NonNullable<GameDashboard['checkIn']>, hasProblem: boolean): string {
    if (checkIn.isDoneToday && checkIn.lastRunAt) return `Hecho a las ${formatDate(checkIn.lastRunAt, 'HH:mm', 'es')}`;
    if (hasProblem && checkIn.lastResult) return CHECK_IN_STATUS_LABELS[checkIn.lastResult.status];
    return `Se pone a las ${this.dashboard().checkInTimeLabel}`;
  }
}

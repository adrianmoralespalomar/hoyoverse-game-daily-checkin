import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import type { BannerView } from '../../models/banner-view.interface';
import { BANNER_KIND_LABELS } from '../../models/banner-kind-labels.const';
import type { GameBanner } from '../../models/game-banner.interface';
import { ClockService } from '../../services/clock.service';
import { formatDaysLeft } from '../../utils/time-left';

/** Los banners activos de un juego, ordenados por el que antes acaba, con lo que queda de cada uno. */
@Component({
  imports: [DatePipe],
  selector: 'app-banners-panel',
  styleUrl: './banners-panel.component.scss',
  templateUrl: './banners-panel.component.html',
})
export class BannersPanelComponent {
  private readonly clock = inject(ClockService);

  readonly banners = input.required<GameBanner[]>();

  protected readonly bannerViews = computed<BannerView[]>(() => {
    const now = this.clock.now();
    return [...this.banners()]
      .sort((a, b) => Date.parse(a.endsAt) - Date.parse(b.endsAt))
      .map(banner => {
        const startsAt = Date.parse(banner.startsAt);
        const duration = Date.parse(banner.endsAt) - startsAt;
        return {
          ...banner,
          kindLabel: BANNER_KIND_LABELS[banner.kind],
          daysLeftText: formatDaysLeft(banner.endsAt, now),
          elapsedPercent: duration > 0 ? Math.min(100, Math.max(0, (now - startsAt) / duration * 100)) : 100,
          isEndingSoon: Date.parse(banner.endsAt) - now < 3 * 24 * 3_600_000,
        };
      });
  });
}

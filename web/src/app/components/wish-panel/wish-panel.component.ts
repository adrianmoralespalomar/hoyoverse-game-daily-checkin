import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import type { GameDashboard } from '../../models/game-dashboard.interface';
import type { GameId } from '../../models/game-id.type';
import type { GameTheme } from '../../models/game-theme.interface';
import { WISH_BANNER_KIND_LABELS } from '../../models/wish-banner-kind-labels.const';
import { WISH_LINK_SCRIPT_PATH } from '../../models/wish-link-script-path.const';
import { HoyoGamesApiService } from '../../services/hoyo-games-api.service';

/** Pity y 50/50 de cada gachapón, y el formulario para pegar el enlace del historial del juego. */
@Component({
  imports: [DatePipe],
  selector: 'app-wish-panel',
  styleUrl: './wish-panel.component.scss',
  templateUrl: './wish-panel.component.html',
})
export class WishPanelComponent {
  private readonly hoyoGamesApi = inject(HoyoGamesApiService);

  readonly gameId = input.required<GameId>();
  readonly theme = input.required<GameTheme>();
  readonly wishesState = input.required<NonNullable<GameDashboard['wishes']>>();

  protected readonly importError = signal<string | null>(null);
  protected readonly isSending = signal(false);
  protected readonly linkDraft = signal('');
  protected readonly bannerKindLabels = WISH_BANNER_KIND_LABELS;
  protected readonly scriptCommand = computed(() => `powershell -ExecutionPolicy Bypass -File ${WISH_LINK_SCRIPT_PATH} -Game ${this.gameId()}`);
  protected readonly banners = computed(() => (this.wishesState().summary?.banners ?? []).map(banner => ({
    ...banner,
    percent: Math.min(100, (banner.pity / banner.hardPity) * 100),
    nextTopText: banner.isGuaranteed === null ? null : banner.isGuaranteed ? 'El próximo es el destacado seguro' : 'El próximo va a 50/50',
  })));

  protected async onWishLinkFormSubmitted(): Promise<void> {
    this.importError.set(null);
    this.isSending.set(true);
    try {
      await this.hoyoGamesApi.importWishes(this.linkDraft().trim());
      this.linkDraft.set('');
      this.hoyoGamesApi.dashboard.reload();
    } catch (error) {
      this.importError.set(error instanceof Error ? error.message : String(error));
    } finally {
      this.isSending.set(false);
    }
  }

  protected onWishLinkChanged(event: Event): void {
    this.linkDraft.set((event.target as HTMLInputElement).value);
  }
}

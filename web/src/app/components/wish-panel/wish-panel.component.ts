import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { COMPACT_TOP_PULLS_SHOWN } from '../../models/compact-top-pulls-shown.const';
import type { GameDashboard } from '../../models/game-dashboard.interface';
import type { GameId } from '../../models/game-id.type';
import type { GameTheme } from '../../models/game-theme.interface';
import { COMMAND_COPY_LABELS } from '../../models/command-copy-labels.const';
import { COMMAND_COPIED_FEEDBACK_MS } from '../../models/command-copied-feedback-ms.const';
import { WISH_BANNER_KIND_LABELS } from '../../models/wish-banner-kind-labels.const';
import { WISH_LINK_SCRIPT_PATH } from '../../models/wish-link-script-path.const';
import { HoyoGamesApiService } from '../../services/hoyo-games-api.service';
import { copyToClipboard } from '../../utils/copy-to-clipboard';
import { describeTopPull } from '../../utils/describe-top-pull';

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
  /** Versión actual del juego, si ya se ha leído el calendario. */
  readonly versionName = input.required<string | null>();
  readonly wishesState = input.required<NonNullable<GameDashboard['wishes']>>();

  protected readonly importError = signal<string | null>(null);
  protected readonly failedIconUrls = signal<ReadonlySet<string>>(new Set());
  protected readonly isHistoryOpen = signal(false);
  protected readonly commandCopyLabels = COMMAND_COPY_LABELS;
  protected readonly commandCopyState = signal<'idle' | 'copied' | 'failed'>('idle');
  protected readonly isSending = signal(false);
  protected readonly linkDraft = signal('');
  protected readonly bannerKindLabels = WISH_BANNER_KIND_LABELS;
  protected readonly scriptCommand = computed(() => `powershell -ExecutionPolicy Bypass -File ${WISH_LINK_SCRIPT_PATH} -Game ${this.gameId()}`);
  /** La última importación fue en otra versión: lo de esta versión aún no está. */
  protected readonly isImportOutdated = computed(() => {
    const importedVersion = this.wishesState().summary?.updatedVersion;
    return !!importedVersion && !!this.versionName() && importedVersion !== this.versionName();
  });
  protected readonly hasLongHistory = computed(() => (this.wishesState().summary?.banners ?? []).some(({ topPulls }) => topPulls.length > COMPACT_TOP_PULLS_SHOWN));
  protected readonly banners = computed(() => (this.wishesState().summary?.banners ?? []).map(banner => ({
    ...banner,
    shownTopPulls: (this.isHistoryOpen() ? banner.topPulls : banner.topPulls.slice(0, COMPACT_TOP_PULLS_SHOWN)).map(pull => ({
      ...pull,
      iconUrl: pull.iconUrl && !this.failedIconUrls().has(pull.iconUrl) ? pull.iconUrl : null,
      initials: pull.name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase(),
      pityLabel: (pull.isFirstInHistory ? '≥' : '') + pull.pity,
      result: pull.wonFiftyFifty === null ? 'neutral' : pull.wonFiftyFifty ? 'won' : 'lost',
      note: describeTopPull(banner.kind, pull),
    })),
    fiftyFifty: banner.kind === 'character' ? {
      won: banner.topPulls.filter(({ wonFiftyFifty }) => wonFiftyFifty === true).length,
      lost: banner.topPulls.filter(({ wonFiftyFifty }) => wonFiftyFifty === false).length,
    } : null,
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

  protected onHistoryButtonClicked(): void {
    this.isHistoryOpen.update(isOpen => !isOpen);
  }

  protected onTopPullIconFailed(iconUrl: string): void {
    this.failedIconUrls.update(urls => new Set(urls).add(iconUrl));
  }

  protected async onCopyCommandButtonClicked(): Promise<void> {
    this.commandCopyState.set(await copyToClipboard(this.scriptCommand()) ? 'copied' : 'failed');
    setTimeout(() => this.commandCopyState.set('idle'), COMMAND_COPIED_FEEDBACK_MS);
  }

  protected onWishLinkChanged(event: Event): void {
    this.linkDraft.set((event.target as HTMLInputElement).value);
  }
}

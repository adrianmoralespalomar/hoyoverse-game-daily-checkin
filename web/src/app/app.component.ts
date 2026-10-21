import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { GameChapterComponent } from './components/game-chapter/game-chapter.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { TodayHeroComponent } from './components/today-hero/today-hero.component';
import { DASHBOARD_REFRESH_INTERVALS_MS } from './models/dashboard-refresh-intervals.const';
import { GAME_THEMES } from './models/game-themes.const';
import { HoyoGamesApiService } from './services/hoyo-games-api.service';

/** Una sola página: los sellos de hoy, un capítulo por juego y el panel de control. */
@Component({
  imports: [ControlPanelComponent, GameChapterComponent, LoginFormComponent, TodayHeroComponent],
  selector: 'app-root',
  styleUrl: './app.component.scss',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly hoyoGamesApi = inject(HoyoGamesApiService);

  protected readonly dashboard = computed(() => this.hoyoGamesApi.dashboard.hasValue() ? this.hoyoGamesApi.dashboard.value() : null);
  protected readonly gameThemes = GAME_THEMES;
  protected readonly needsLogin = computed(() => {
    const { authStatus } = this.hoyoGamesApi;
    return authStatus.hasValue() && authStatus.value().required && !authStatus.value().authenticated;
  });
  private refreshTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => clearTimeout(this.refreshTimeout));
    this.scheduleDashboardRefresh();
  }

  /** Mientras el NAS trabaja se recarga cada pocos segundos, para ver caer los sellos y los códigos. */
  private scheduleDashboardRefresh(): void {
    const delay = this.dashboard()?.isBusy ? DASHBOARD_REFRESH_INTERVALS_MS.busy : DASHBOARD_REFRESH_INTERVALS_MS.idle;
    this.refreshTimeout = setTimeout(() => {
      this.hoyoGamesApi.dashboard.reload();
      this.scheduleDashboardRefresh();
    }, delay);
  }
}

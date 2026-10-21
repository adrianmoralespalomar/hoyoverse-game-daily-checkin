import { Component, inject, signal } from '@angular/core';
import { HoyoGamesApiService } from '../../services/hoyo-games-api.service';

/** Contraseña del panel (`WEB_PASSWORD`): se pide una vez por navegador y el NAS lo recuerda un año. */
@Component({
  selector: 'app-login-form',
  styleUrl: './login-form.component.scss',
  templateUrl: './login-form.component.html',
})
export class LoginFormComponent {
  private readonly hoyoGamesApi = inject(HoyoGamesApiService);

  protected readonly isLoggingIn = signal(false);
  protected readonly loginError = signal<string | null>(null);
  protected readonly password = signal('');

  /** Recarga la página entera: así el panel vuelve a pedir sus datos ya con la sesión. */
  protected async onLoginFormSubmitted(): Promise<void> {
    this.isLoggingIn.set(true);
    try {
      await this.hoyoGamesApi.logIn(this.password());
      location.reload();
    } catch (error) {
      this.loginError.set(error instanceof Error ? error.message : String(error));
      this.isLoggingIn.set(false);
    }
  }

  protected onPasswordChanged(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
  }
}

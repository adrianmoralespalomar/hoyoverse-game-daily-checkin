import { Component, input } from '@angular/core';
import { COOKIE_GUIDES } from '../../models/cookie-guides.const';
import { NAS_ENV_FILE_PATH } from '../../models/nas-env-file-path.const';

/** Qué hacer cuando una cookie caduca. Se abre sola si alguna falla. */
@Component({
  selector: 'app-cookie-guide',
  styleUrl: './cookie-guide.component.scss',
  templateUrl: './cookie-guide.component.html',
})
export class CookieGuideComponent {
  readonly isOpen = input(false);

  protected readonly cookieGuides = Object.values(COOKIE_GUIDES);
  protected readonly nasEnvFilePath = NAS_ENV_FILE_PATH;
}

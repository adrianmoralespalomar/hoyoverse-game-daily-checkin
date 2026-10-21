import { Injectable, signal } from '@angular/core';
import { CLOCK_TICK_MS } from '../models/clock-tick-ms.const';

/** La hora actual como signal, para que la resina estimada y las cuentas atrás se muevan solas. */
@Injectable({ providedIn: 'root' })
export class ClockService {
  readonly now = signal(Date.now());

  constructor() {
    setInterval(() => this.now.set(Date.now()), CLOCK_TICK_MS);
  }
}

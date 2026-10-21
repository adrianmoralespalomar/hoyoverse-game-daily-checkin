import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import type { GameDashboard } from '../../models/game-dashboard.interface';
import type { NoteMeterView } from '../../models/note-meter-view.interface';
import { ClockService } from '../../services/clock.service';
import { HoyoGamesApiService } from '../../services/hoyo-games-api.service';
import { estimateStamina, formatReadyTime, formatTimeLeft, isMeterFull } from '../../utils/realtime-notes';

/** Resina o energía de un juego, con cuándo se llena, y el resto de contadores (diarias, semanales...). */
@Component({
  imports: [DatePipe],
  selector: 'app-energy-panel',
  styleUrl: './energy-panel.component.scss',
  templateUrl: './energy-panel.component.html',
})
export class EnergyPanelComponent {
  private readonly clock = inject(ClockService);
  private readonly hoyoGamesApi = inject(HoyoGamesApiService);

  readonly notesState = input.required<NonNullable<GameDashboard['notes']>>();

  protected readonly isRefreshing = signal(false);
  protected readonly notes = computed(() => this.notesState().notes ?? null);
  protected readonly stamina = computed(() => {
    const notes = this.notes();
    if (!notes) return null;
    const now = this.clock.now();
    const current = estimateStamina(notes, now);
    const { fullAt, max } = notes.stamina;
    const isFull = current >= max;
    const readyText = isFull || !fullAt
      ? 'Está llena: lo que se recargue ahora se pierde.'
      : `Se llena ${formatReadyTime(fullAt, now)}, dentro de ${formatTimeLeft(fullAt, now)}.`;
    return { label: notes.stamina.label, current, max, percent: Math.min(100, (current / max) * 100), isFull, readyText };
  });
  protected readonly meters = computed<NoteMeterView[]>(() => {
    const now = this.clock.now();
    return (this.notes()?.meters ?? []).map(meter => {
      const isFull = isMeterFull(meter, now);
      return {
        label: meter.label,
        current: isFull && meter.fullAt !== undefined ? meter.max : meter.current,
        max: meter.max,
        percent: isFull ? 100 : Math.min(100, (meter.current / meter.max) * 100),
        isFull,
        readyText: meter.fullAt && !isFull ? `Lleno ${formatReadyTime(meter.fullAt, now)}` : null,
      };
    });
  });
  protected readonly expeditionsText = computed(() => {
    const expeditions = this.notes()?.expeditions;
    if (!expeditions) return null;
    const now = this.clock.now();
    const allReady = !expeditions.allReadyAt || Date.parse(expeditions.allReadyAt) <= now;
    if (allReady) return `Expediciones: las ${expeditions.total} están listas para recoger.`;
    return `Expediciones: ${expeditions.ready} de ${expeditions.total} listas. Todas ${formatReadyTime(expeditions.allReadyAt!, now)}.`;
  });

  protected async onRefreshNotesButtonClicked(): Promise<void> {
    this.isRefreshing.set(true);
    try {
      await this.hoyoGamesApi.refreshNotes();
      this.hoyoGamesApi.dashboard.reload();
    } finally {
      this.isRefreshing.set(false);
    }
  }
}

export interface PendingEvent {
  name: string;
  /** Moneda de tiradas del evento: la que falta en ZZZ; la del evento entero en Genshin y Star Rail (no dicen más). */
  currency: number;
  endsAt: string | null;
}

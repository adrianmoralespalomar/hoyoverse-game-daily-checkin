import type { GameId } from './game-id.type.ts';

/**
 * Cómo se comporta la energía principal de cada juego al llenarse. Genshin y Zenless la pierden; Star Rail manda lo
 * que sobra a la reserva del poder trazacaminos, así que ahí no se avisa.
 */
export const STAMINA_OVERFLOW_RULES: Record<GameId, { staminaName: string; isOverflowLost: boolean }> = {
  gi: { staminaName: 'resina', isOverflowLost: true },
  hsr: { staminaName: 'poder trazacaminos', isOverflowLost: false },
  zzz: { staminaName: 'batería', isOverflowLost: true },
};

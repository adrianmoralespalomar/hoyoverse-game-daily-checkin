import type { AlertRule } from '../models/alert-rule.interface.ts';
import { STAMINA_OVERFLOW_RULES } from '../models/stamina-overflow-rules.const.ts';
import { getNextTimeOfDayMs } from './next-time-of-day.ts';

const formatClock = (timestamp: number): string => new Date(timestamp).toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' });

/** Si la energía se llena antes de que te despiertes y lo que sobra se pierde, avisa de cuándo y cuánto. */
export const staminaOverflowAlertRule: AlertRule = {
  id: 'stamina-overflow',
  label: 'Energía que se llena mientras duermes',
  description: 'Avisa si la resina (Genshin) o la batería (Zenless) se llena antes de la hora a la que te despiertas, para gastarla antes. Star Rail no pierde nada: lo que sobra va a la reserva.',
  evaluate: ({ now, wakeUpTime, games }) => games.flatMap(game => {
    const { staminaName, isOverflowLost } = STAMINA_OVERFLOW_RULES[game.id];
    const stamina = game.notes?.notes?.stamina;
    if (!isOverflowLost || !stamina) return [];
    const fullAt = stamina.current >= stamina.max ? now : stamina.fullAt ? Date.parse(stamina.fullAt) : null;
    const wakeUpAt = getNextTimeOfDayMs(wakeUpTime, now);
    if (fullAt === null || fullAt >= wakeUpAt) return [];
    const lostPoints = Math.floor((wakeUpAt - Math.max(fullAt, now)) / 1000 / stamina.regenSeconds);
    if (lostPoints < 1) return [];
    return [{
      id: `${staminaOverflowAlertRule.id}:${game.id}`,
      gameId: game.id,
      severity: 'warning',
      title: `Se te llenará la ${staminaName}`,
      message: fullAt <= now
        ? `Ya está llena y no te despiertas hasta las ${formatClock(wakeUpAt)}: estás perdiendo ${staminaName}. Gástala ya.`
        : `Se llena a las ${formatClock(fullAt)} y no te despiertas hasta las ${formatClock(wakeUpAt)}: perderías unas ${lostPoints}. Gasta antes de dormir.`,
      href: `#${game.id}`,
    }];
  }),
};

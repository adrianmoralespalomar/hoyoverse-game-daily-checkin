import type { AlertRule } from '../models/alert-rule.interface.ts';
import { DAY_MS } from '../models/day-ms.const.ts';
import { LIVESTREAM_ALERT_LEAD_DAYS } from '../models/livestream-alert-lead-days.const.ts';
import { formatTimeLeft } from './format-time-left.ts';

const LIVESTREAM_DATE_FORMAT = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });

/** Avisa los últimos días antes del directo, con lo que queda: en él se regalan códigos que caducan pronto. */
export const livestreamAlertRule: AlertRule = {
  id: 'livestream',
  label: 'Directo de la próxima versión',
  description: `Avisa ${LIVESTREAM_ALERT_LEAD_DAYS} días antes del directo de cada juego, con el tiempo que queda y la hora de Madrid: suelta códigos que caducan en pocas horas.`,
  evaluate: ({ now, games, livestreams }) => games.flatMap(game => {
    const livestream = livestreams[game.id];
    const startsAt = livestream && Date.parse(livestream.startsAt);
    if (!livestream || !startsAt || startsAt <= now || startsAt - now > LIVESTREAM_ALERT_LEAD_DAYS * DAY_MS) return [];
    return [{
      id: `${livestreamAlertRule.id}:${game.id}:${livestream.startsAt}`,
      gameId: game.id,
      severity: 'info',
      title: livestream.version ? `Directo de la ${livestream.version}` : 'Directo de la próxima versión',
      message: `Queda ${formatTimeLeft(startsAt - now)}: ${LIVESTREAM_DATE_FORMAT.format(new Date(startsAt))} (hora de Madrid). Da códigos que caducan en pocas horas.`,
    }];
  }),
};
